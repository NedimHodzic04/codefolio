/**
 * Feature: dashboard, Property 4: Project CRUD operations maintain referential integrity
 * Validates: Requirements 5.2, 7.2, 8.2
 * 
 * Property: For any project operation (create, update, delete), the project's user 
 * reference should always point to the authenticated user performing the operation.
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

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Project CRUD operations maintain referential integrity');
  console.log('Feature: dashboard, Property 4');
  console.log('Validates: Requirements 5.2, 7.2, 8.2\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await Project.deleteMany({});
    await User.deleteMany({});
    
    const authenticatedUser = await createTestUser('-auth');
    const otherUser = await createTestUser('-other');

    await fc.assert(
      fc.asyncProperty(projectDataArbitrary, async (projectData) => {
        // CREATE operation - verify project is created with authenticated user's ID
        const newProject = new Project({
          user: authenticatedUser._id,
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

        // Verify the project's user reference points to the authenticated user
        const createdProject = await Project.findById(newProject._id);
        if (!createdProject.user.equals(authenticatedUser._id)) {
          throw new Error(
            `CREATE: Referential integrity violated! Project user (${createdProject.user}) does not match authenticated user (${authenticatedUser._id})`
          );
        }

        // UPDATE operation - verify project can only be updated by the owning user
        const updateData = {
          title: `Updated ${projectData.title}`,
          description: 'Updated description',
        };

        // Simulate checking ownership before update (as controller does)
        const projectToUpdate = await Project.findOne({
          _id: createdProject._id,
          user: authenticatedUser._id,
        });

        if (!projectToUpdate) {
          throw new Error('UPDATE: Project not found for authenticated user');
        }

        // Perform update
        const updatedProject = await Project.findByIdAndUpdate(
          createdProject._id,
          updateData,
          { new: true }
        );

        // Verify user reference is still intact after update
        if (!updatedProject.user.equals(authenticatedUser._id)) {
          throw new Error(
            `UPDATE: Referential integrity violated! Project user (${updatedProject.user}) does not match authenticated user (${authenticatedUser._id})`
          );
        }

        // Verify that another user cannot access this project
        const projectForOtherUser = await Project.findOne({
          _id: createdProject._id,
          user: otherUser._id,
        });

        if (projectForOtherUser !== null) {
          throw new Error(
            `UPDATE: Referential integrity violated! Other user can access project that doesn't belong to them`
          );
        }

        // DELETE operation - verify project can only be deleted by the owning user
        const projectToDelete = await Project.findOne({
          _id: createdProject._id,
          user: authenticatedUser._id,
        });

        if (!projectToDelete) {
          throw new Error('DELETE: Project not found for authenticated user');
        }

        // Verify user reference before deletion
        if (!projectToDelete.user.equals(authenticatedUser._id)) {
          throw new Error(
            `DELETE: Referential integrity violated! Project user (${projectToDelete.user}) does not match authenticated user (${authenticatedUser._id})`
          );
        }

        // Perform deletion
        await Project.findByIdAndDelete(createdProject._id);

        // Verify project is deleted
        const deletedProject = await Project.findById(createdProject._id);
        if (deletedProject !== null) {
          throw new Error('DELETE: Project was not properly deleted');
        }
      }),
      { numRuns: 100 }
    );

    console.log('✓ Property test passed! (100 runs)');
    console.log('All project CRUD operations maintained referential integrity.');
    
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
