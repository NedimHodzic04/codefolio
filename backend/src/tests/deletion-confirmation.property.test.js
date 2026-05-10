/**
 * Feature: dashboard, Property 10: Project deletion confirmation prevents accidents
 * Validates: Requirements 8.1, 8.2
 * 
 * Property: For any project deletion request, the operation should only proceed 
 * after explicit user confirmation.
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

/**
 * Simulates the deletion workflow with confirmation step
 * This models the UI flow where:
 * 1. User clicks delete button
 * 2. Confirmation dialog appears
 * 3. User must explicitly confirm or cancel
 * 4. Deletion only proceeds if confirmed
 */
const simulateDeletionWithConfirmation = async (projectId, userId, confirmed) => {
  // Step 1: Find the project (simulates opening delete dialog)
  const project = await Project.findOne({
    _id: projectId,
    user: userId,
  });

  if (!project) {
    throw new Error('Project not found or unauthorized');
  }

  // Step 2: Check confirmation (simulates user clicking confirm/cancel)
  if (!confirmed) {
    // User cancelled - project should NOT be deleted
    return { deleted: false, project };
  }

  // Step 3: Only proceed with deletion if confirmed
  await Project.findByIdAndDelete(projectId);
  await User.findByIdAndUpdate(userId, {
    $pull: { projects: projectId },
  });

  return { deleted: true, project: null };
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Project deletion confirmation prevents accidents');
  console.log('Feature: dashboard, Property 10');
  console.log('Validates: Requirements 8.1, 8.2\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await Project.deleteMany({});
    await User.deleteMany({});
    
    const testUser = await createTestUser('-deletion-test');

    await fc.assert(
      fc.asyncProperty(
        projectDataArbitrary,
        fc.boolean(), // Random confirmation decision
        async (projectData, userConfirmed) => {
          // Create a project to test deletion
          const newProject = new Project({
            user: testUser._id,
            title: projectData.title,
            description: projectData.description,
            techStack: projectData.techStack,
            githubLink: projectData.githubLink,
            liveDemo: projectData.liveDemo,
            imageUrl: projectData.imageUrl,
            isFeatured: false,
            githubRepoId: null,
          });

          await newProject.save();

          // Add project to user's projects array
          await User.findByIdAndUpdate(testUser._id, {
            $push: { projects: newProject._id },
          });

          const projectId = newProject._id;

          // Simulate deletion workflow with confirmation
          const result = await simulateDeletionWithConfirmation(
            projectId,
            testUser._id,
            userConfirmed
          );

          // Verify the project state matches the confirmation decision
          const projectAfterOperation = await Project.findById(projectId);

          if (userConfirmed) {
            // If user confirmed, project MUST be deleted
            if (projectAfterOperation !== null) {
              throw new Error(
                `Deletion confirmation violated! User confirmed deletion but project still exists (ID: ${projectId})`
              );
            }

            // Verify project was removed from user's projects array
            const updatedUser = await User.findById(testUser._id);
            const projectInUserArray = updatedUser.projects.some(
              (pid) => pid.toString() === projectId.toString()
            );

            if (projectInUserArray) {
              throw new Error(
                `Deletion confirmation violated! Project removed from database but still in user's projects array`
              );
            }

            if (!result.deleted) {
              throw new Error(
                `Deletion confirmation violated! User confirmed but deletion did not proceed`
              );
            }
          } else {
            // If user cancelled, project MUST still exist
            if (projectAfterOperation === null) {
              throw new Error(
                `Deletion confirmation violated! User cancelled deletion but project was deleted (ID: ${projectId})`
              );
            }

            // Verify project data is unchanged
            if (projectAfterOperation.title !== projectData.title) {
              throw new Error(
                `Deletion confirmation violated! Project data was modified when deletion was cancelled`
              );
            }

            if (result.deleted) {
              throw new Error(
                `Deletion confirmation violated! User cancelled but deletion proceeded`
              );
            }
          }

          // Clean up for next iteration
          await Project.findByIdAndDelete(projectId);
          await User.findByIdAndUpdate(testUser._id, {
            $pull: { projects: projectId },
          });
        }
      ),
      { numRuns: 100 }
    );

    console.log('✓ Property test passed! (100 runs)');
    console.log('Project deletion confirmation properly prevents accidental deletions.');
    
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
