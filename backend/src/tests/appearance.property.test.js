/**
 * Feature: dashboard, Property 8: Appearance changes reflect immediately
 * Validates: Requirements 11.2, 11.3, 12.2, 12.3
 * 
 * Property: For any layout template or theme selection, saving the change should update 
 * the user's database record and the public portfolio should render with the new appearance 
 * on next load.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { LAYOUT_TEMPLATES, THEMES } from '../models/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
const layoutTemplateArbitrary = fc.constantFrom(...LAYOUT_TEMPLATES);
const themeArbitrary = fc.constantFrom(...THEMES);

const appearanceUpdateArbitrary = fc.record({
  layoutTemplate: fc.option(layoutTemplateArbitrary, { nil: undefined }),
  theme: fc.option(themeArbitrary, { nil: undefined }),
});

// Helper to create a test user
const createTestUser = async () => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}`,
    username: `testuser-${Date.now()}`,
    displayName: 'Test User',
    email: 'test@example.com',
    layoutTemplate: 'default',
    theme: 'light',
  });
  await user.save();
  return user;
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Appearance changes reflect immediately');
  console.log('Feature: dashboard, Property 8');
  console.log('Validates: Requirements 11.2, 11.3, 12.2, 12.3\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await User.deleteMany({});

    console.log('Testing appearance updates (layoutTemplate and theme)...');
    await fc.assert(
      fc.asyncProperty(appearanceUpdateArbitrary, async (appearanceUpdate) => {
        const testUser = await createTestUser();
        
        // Prepare update data
        const updateData = {};
        if (appearanceUpdate.layoutTemplate !== undefined) {
          updateData.layoutTemplate = appearanceUpdate.layoutTemplate;
        }
        if (appearanceUpdate.theme !== undefined) {
          updateData.theme = appearanceUpdate.theme;
        }

        // Perform update
        const updatedUser = await User.findByIdAndUpdate(
          testUser._id,
          updateData,
          { new: true }
        );

        // Verify the update persisted in the returned object
        if (appearanceUpdate.layoutTemplate !== undefined) {
          if (updatedUser.layoutTemplate !== appearanceUpdate.layoutTemplate) {
            throw new Error(
              `Layout template update failed: expected "${appearanceUpdate.layoutTemplate}", got "${updatedUser.layoutTemplate}"`
            );
          }
        }
        
        if (appearanceUpdate.theme !== undefined) {
          if (updatedUser.theme !== appearanceUpdate.theme) {
            throw new Error(
              `Theme update failed: expected "${appearanceUpdate.theme}", got "${updatedUser.theme}"`
            );
          }
        }

        // Verify the update persisted in the database (simulating "next load")
        const dbUser = await User.findById(testUser._id);
        
        if (appearanceUpdate.layoutTemplate !== undefined) {
          if (dbUser.layoutTemplate !== appearanceUpdate.layoutTemplate) {
            throw new Error(
              `Layout template not persisted in DB: expected "${appearanceUpdate.layoutTemplate}", got "${dbUser.layoutTemplate}"`
            );
          }
        }
        
        if (appearanceUpdate.theme !== undefined) {
          if (dbUser.theme !== appearanceUpdate.theme) {
            throw new Error(
              `Theme not persisted in DB: expected "${appearanceUpdate.theme}", got "${dbUser.theme}"`
            );
          }
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
      }),
      { numRuns: 100 }
    );

    console.log('✓ Appearance updates test passed! (100 runs)');
    console.log('\n✓ All appearance update tests passed!');
    console.log('Appearance changes persist correctly and reflect immediately on next load.');
    
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
