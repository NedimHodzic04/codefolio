/**
 * Feature: dashboard, Property 11: Project visibility toggle correctly filters public portfolio
 * Validates: Project visibility feature
 * 
 * Property: When a project's visibility is toggled, it should:
 * 1. Toggle between visible (true) and hidden (false) states
 * 2. Only appear in public portfolio when isVisible = true
 * 3. Always appear in dashboard (authenticated) regardless of visibility
 * 4. Maintain all other project data unchanged during toggle
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to test database
const connectTestDB = async () => {
  const testMongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(testMongoUri);
};

// Disconnect and cleanup
const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

// Custom arbitraries for generating test data
const projectDataArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  techStack: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
  githubLink: fc.option(fc.webUrl(), { nil: undefined }),
  liveDemo: fc.option(fc.webUrl(), { nil: undefined }),
  imageUrl: fc.option(fc.webUrl(), { nil: undefined }),
  initialVisibility: fc.boolean(),
});

// Helper to create a test user
const createTestUser = async (suffix = '') => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}${suffix}`,
    username: `testuser-${Date.now()}${suffix}`,
    displayName: `Test User ${suffix}`,
    email: `test${suffix}@example.com`,
  });
  await user.save();
  return user;
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Project visibility toggle correctly filters public portfolio');
  console.log('Feature: dashboard, Property 11');
  console.log('Validates: Project visibility feature\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await Project.deleteMany({});
    await User.deleteMany({});
    
    const testUser = await createTestUser('-visibility');

    await fc.assert(
      fc.asyncProperty(projectDataArbitrary, async (projectData) => {
        // CREATE project with initial visibility state
        const newProject = new Project({
          user: testUser._id,
          title: projectData.title,
          description: projectData.description,
          techStack: projectData.techStack,
          githubLink: projectData.githubLink,
          liveDemo: projectData.liveDemo,
          imageUrl: projectData.imageUrl,
          isVisible: projectData.initialVisibility,
          isFeatured: false,
          githubRepoId: null,
        });

        await newProject.save();

        // Verify initial visibility state
        const createdProject = await Project.findById(newProject._id);
        if (createdProject.isVisible !== projectData.initialVisibility) {
          throw new Error(
            `Initial visibility mismatch! Expected ${projectData.initialVisibility}, got ${createdProject.isVisible}`
          );
        }

        // Store original data for comparison
        const originalData = {
          title: createdProject.title,
          description: createdProject.description,
          techStack: [...(createdProject.techStack || [])],
          githubLink: createdProject.githubLink,
          liveDemo: createdProject.liveDemo,
          imageUrl: createdProject.imageUrl,
        };

        // TOGGLE visibility (simulate controller action)
        createdProject.isVisible = !createdProject.isVisible;
        await createdProject.save();

        const toggledProject = await Project.findById(newProject._id);

        // Verify visibility was toggled
        if (toggledProject.isVisible === projectData.initialVisibility) {
          throw new Error(
            `Visibility was not toggled! Still ${toggledProject.isVisible}`
          );
        }

        // Verify all other data remained unchanged
        if (toggledProject.title !== originalData.title) {
          throw new Error('Title changed during visibility toggle!');
        }
        if (toggledProject.description !== originalData.description) {
          throw new Error('Description changed during visibility toggle!');
        }
        if (toggledProject.githubLink !== originalData.githubLink) {
          throw new Error('GitHub link changed during visibility toggle!');
        }
        if (toggledProject.liveDemo !== originalData.liveDemo) {
          throw new Error('Live demo link changed during visibility toggle!');
        }
        if (toggledProject.imageUrl !== originalData.imageUrl) {
          throw new Error('Image URL changed during visibility toggle!');
        }

        // Verify public portfolio filtering (isVisible: true)
        const publicProjects = await Project.find({
          user: testUser._id,
          isVisible: true,
        });

        if (toggledProject.isVisible) {
          // Should be in public portfolio
          const foundInPublic = publicProjects.some(p => p._id.equals(toggledProject._id));
          if (!foundInPublic) {
            throw new Error('Visible project not found in public portfolio query!');
          }
        } else {
          // Should NOT be in public portfolio
          const foundInPublic = publicProjects.some(p => p._id.equals(toggledProject._id));
          if (foundInPublic) {
            throw new Error('Hidden project found in public portfolio query!');
          }
        }

        // Verify dashboard (authenticated) shows all projects regardless of visibility
        const allUserProjects = await Project.find({ user: testUser._id });
        const foundInDashboard = allUserProjects.some(p => p._id.equals(toggledProject._id));
        if (!foundInDashboard) {
          throw new Error('Project not found in dashboard query (should show all projects)!');
        }

        // TOGGLE back to original state
        toggledProject.isVisible = !toggledProject.isVisible;
        await toggledProject.save();

        const retoggledProject = await Project.findById(newProject._id);

        // Verify visibility returned to original state
        if (retoggledProject.isVisible !== projectData.initialVisibility) {
          throw new Error(
            `Visibility not restored to original state! Expected ${projectData.initialVisibility}, got ${retoggledProject.isVisible}`
          );
        }

        // Clean up
        await Project.findByIdAndDelete(newProject._id);
      }),
      { numRuns: 100 }
    );

    console.log('✓ Property test passed! (100 runs)');
    console.log('Project visibility toggle correctly filters public portfolio.');
    
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
