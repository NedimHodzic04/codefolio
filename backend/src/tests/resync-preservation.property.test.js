/**
 * Feature: dashboard, Property 5: GitHub re-sync preserves custom projects
 * Validates: Requirements 6.2
 * 
 * Property: For any user with both GitHub-imported and custom projects, running re-sync 
 * should update GitHub projects but never delete or modify custom projects (those without githubRepoId).
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
  await Project.collection.drop().catch(() => {}); // Drop collection to reset indexes
  await User.collection.drop().catch(() => {});
  await mongoose.connection.close();
};

// Custom arbitraries for generating test data
const customProjectArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  techStack: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
  liveDemo: fc.option(fc.webUrl(), { nil: undefined }),
});

const githubProjectArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  githubRepoId: fc.integer({ min: 1, max: 1000000 }),
  language: fc.option(fc.constantFrom('JavaScript', 'Python', 'Java', 'TypeScript', 'Go'), { nil: undefined }),
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
  console.log('Starting Property Test: GitHub re-sync preserves custom projects');
  console.log('Feature: dashboard, Property 5');
  console.log('Validates: Requirements 6.2\n');

  await connectTestDB();
  
  try {
    await fc.assert(
      fc.asyncProperty(
        fc.array(customProjectArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(githubProjectArbitrary, { minLength: 1, maxLength: 5 }),
        async (customProjects, githubProjects) => {
          // Clean up before each test run
          await Project.deleteMany({});
          await User.deleteMany({});
          
          const user = await createTestUser();

          // Create custom projects (no githubRepoId)
          const createdCustomProjects = [];
          for (const customProject of customProjects) {
            const project = new Project({
              user: user._id,
              title: customProject.title,
              description: customProject.description,
              techStack: customProject.techStack,
              liveDemo: customProject.liveDemo,
              githubRepoId: null, // Custom project
            });
            await project.save();
            createdCustomProjects.push(project);
          }

          // Create initial GitHub projects
          const createdGitHubProjects = [];
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
            createdGitHubProjects.push(project);
          }

          // Count projects before re-sync
          const customProjectCountBefore = await Project.countDocuments({
            user: user._id,
            githubRepoId: null,
          });
          const totalProjectCountBefore = await Project.countDocuments({
            user: user._id,
          });

          // Mock GitHub API to return updated repos
          const mockRepos = githubProjects.map((gp) => ({
            id: gp.githubRepoId,
            name: `Updated ${gp.title}`,
            description: `Updated ${gp.description || ''}`,
            html_url: `https://github.com/test/updated-${gp.title}`,
            language: gp.language || 'JavaScript',
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
          const customProjectCountAfter = await Project.countDocuments({
            user: user._id,
            githubRepoId: null,
          });

          // Verify custom projects are preserved
          if (customProjectCountBefore !== customProjectCountAfter) {
            throw new Error(
              `Custom projects were not preserved! Before: ${customProjectCountBefore}, After: ${customProjectCountAfter}`
            );
          }

          // Verify each custom project still exists with original data
          for (const customProject of createdCustomProjects) {
            const stillExists = await Project.findById(customProject._id);
            if (!stillExists) {
              throw new Error(
                `Custom project "${customProject.title}" was deleted during re-sync!`
              );
            }
            if (stillExists.title !== customProject.title) {
              throw new Error(
                `Custom project "${customProject.title}" was modified during re-sync!`
              );
            }
            if (stillExists.githubRepoId !== null) {
              throw new Error(
                `Custom project "${customProject.title}" had githubRepoId added during re-sync!`
              );
            }
          }

          // Verify GitHub projects were updated
          for (const githubProject of githubProjects) {
            const updated = await Project.findOne({
              user: user._id,
              githubRepoId: githubProject.githubRepoId,
            });
            if (!updated) {
              throw new Error(
                `GitHub project with ID ${githubProject.githubRepoId} was not found after re-sync!`
              );
            }
            if (!updated.title.includes('Updated')) {
              throw new Error(
                `GitHub project with ID ${githubProject.githubRepoId} was not updated during re-sync!`
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );

    console.log('✓ Property test passed! (100 runs)');
    console.log('GitHub re-sync preserved all custom projects while updating GitHub projects.');
    
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
