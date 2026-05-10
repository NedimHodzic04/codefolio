/**
 * Feature: dashboard, Property 6: GitHub re-sync upserts correctly
 * Validates: Requirements 6.2
 * 
 * Property: For any GitHub repository that already exists in the database (matched by githubRepoId), 
 * re-sync should update its fields rather than creating a duplicate.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import { fetchAndSaveRepos } from '../utils/github.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to test database
const connectTestDB = async () => {
  const testMongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(testMongoUri);
  
  // Drop collections to ensure clean state with proper indexes
  await Project.collection.drop().catch(() => {});
  await User.collection.drop().catch(() => {});
  
  // Recreate indexes from schema
  await Project.init();
  await User.init();
};

// Disconnect and cleanup
const disconnectTestDB = async () => {
  await Project.collection.drop().catch(() => {});
  await User.collection.drop().catch(() => {});
  await mongoose.connection.close();
};

// Custom arbitraries for generating test data
const githubProjectArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  githubRepoId: fc.integer({ min: 1, max: 1000000 }),
  language: fc.option(fc.constantFrom('JavaScript', 'Python', 'Java', 'TypeScript', 'Go'), { nil: undefined }),
});

// Generate array of projects with unique githubRepoId values
const uniqueGithubProjectsArbitrary = fc
  .array(githubProjectArbitrary, { minLength: 1, maxLength: 5 })
  .map((projects) => {
    // Ensure unique githubRepoId values by tracking seen IDs
    const seenIds = new Set();
    return projects.map((project, index) => {
      let uniqueId = project.githubRepoId;
      // If ID is duplicate, generate a new unique one
      while (seenIds.has(uniqueId)) {
        uniqueId = (uniqueId + 1) % 1000000 || 1;
      }
      seenIds.add(uniqueId);
      return { ...project, githubRepoId: uniqueId };
    });
  });

// Helper to create a test user
const createTestUser = async () => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}`,
    username: `testuser-${Date.now()}`,
    displayName: `Test User`,
    email: `test@example.com`,
    githubAccessToken: 'mock-token',
  });
  await user.save();
  return user;
};

// Mock fetch for GitHub API
const originalFetch = global.fetch;
const mockGitHubAPI = (repos) => {
  global.fetch = async (url, options) => {
    if (url.includes('api.github.com/user/repos')) {
      return {
        ok: true,
        json: async () => repos,
      };
    }
    return originalFetch(url, options);
  };
};

const restoreFetch = () => {
  global.fetch = originalFetch;
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: GitHub re-sync upserts correctly');
  console.log('Feature: dashboard, Property 6');
  console.log('Validates: Requirements 6.2\n');

  await connectTestDB();
  
  try {
    await fc.assert(
      fc.asyncProperty(
        uniqueGithubProjectsArbitrary,
        async (githubProjects) => {
          // Clean up before each test run
          await Project.deleteMany({});
          await User.deleteMany({});
          
          const user = await createTestUser();

          // Create initial GitHub projects
          const createdProjects = [];
          for (const githubProject of githubProjects) {
            const project = new Project({
              user: user._id,
              title: githubProject.title,
              description: githubProject.description,
              githubRepoId: githubProject.githubRepoId,
              language: githubProject.language,
              githubLink: `https://github.com/test/${githubProject.title}`,
            });
            await project.save();
            createdProjects.push(project);
          }

          // Count projects before re-sync
          const projectCountBefore = await Project.countDocuments({
            user: user._id,
          });

          // Mock GitHub API to return updated repos with same IDs but different data
          const mockRepos = githubProjects.map((gp) => ({
            id: gp.githubRepoId,
            name: `Updated-${gp.title}`,
            description: `Updated description for ${gp.title}`,
            html_url: `https://github.com/test/updated-${gp.title}`,
            language: gp.language === 'JavaScript' ? 'TypeScript' : 'JavaScript',
            fork: false,
          }));

          mockGitHubAPI(mockRepos);

          // Perform re-sync
          const result = await fetchAndSaveRepos(user.githubAccessToken, user._id);

          restoreFetch();

          if (!result.success) {
            throw new Error(`Re-sync failed: ${result.error}`);
          }

          // Count projects after re-sync
          const projectCountAfter = await Project.countDocuments({
            user: user._id,
          });

          // Verify no duplicates were created (upsert behavior)
          if (projectCountBefore !== projectCountAfter) {
            throw new Error(
              `Upsert failed! Duplicates were created. Before: ${projectCountBefore}, After: ${projectCountAfter}`
            );
          }

          // Verify each project was updated, not duplicated
          for (const githubProject of githubProjects) {
            const projects = await Project.find({
              user: user._id,
              githubRepoId: githubProject.githubRepoId,
            });

            if (projects.length !== 1) {
              throw new Error(
                `Duplicate projects found for githubRepoId ${githubProject.githubRepoId}! Found ${projects.length} projects.`
              );
            }

            const updatedProject = projects[0];

            // Verify the project was updated with new data
            if (!updatedProject.title.includes('Updated')) {
              throw new Error(
                `Project with githubRepoId ${githubProject.githubRepoId} was not updated! Title: ${updatedProject.title}`
              );
            }

            if (!updatedProject.description.includes('Updated description')) {
              throw new Error(
                `Project with githubRepoId ${githubProject.githubRepoId} description was not updated!`
              );
            }

            // Verify the githubRepoId remained the same
            if (updatedProject.githubRepoId !== githubProject.githubRepoId) {
              throw new Error(
                `Project githubRepoId changed during upsert! Expected: ${githubProject.githubRepoId}, Got: ${updatedProject.githubRepoId}`
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );

    console.log('✓ Property test passed! (100 runs)');
    console.log('GitHub re-sync correctly upserted existing projects without creating duplicates.');
    
  } catch (error) {
    console.error('✗ Property test failed!');
    console.error(error.message);
    throw error;
  } finally {
    await disconnectTestDB();
  }
};

// Run the test
runPropertyTest()
  .then(() => {
    console.log('\nTest completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest failed with error:', error);
    process.exit(1);
  });
