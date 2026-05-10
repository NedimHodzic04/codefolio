/**
 * Feature: dashboard, Property 2: Skill additions are idempotent
 * Validates: Requirements 3.1, 3.3
 * 
 * Property: For any skill string, adding it multiple times should result in the skill 
 * appearing exactly once in the user's skill list.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
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

// Custom arbitrary for generating skill names
const skillArbitrary = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

// Helper to create a test user
const createTestUser = async () => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}`,
    username: `testuser-${Date.now()}`,
    displayName: 'Test User',
    email: 'test@example.com',
    skills: [],
  });
  await user.save();
  return user;
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Skill additions are idempotent');
  console.log('Feature: dashboard, Property 2');
  console.log('Validates: Requirements 3.1, 3.3\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await User.deleteMany({});

    console.log('Testing skill idempotence...');
    await fc.assert(
      fc.asyncProperty(
        skillArbitrary,
        fc.integer({ min: 2, max: 5 }), // Number of times to add the same skill
        async (skill, addCount) => {
          const testUser = await createTestUser();
          
          // Add the same skill multiple times
          for (let i = 0; i < addCount; i++) {
            await User.findByIdAndUpdate(
              testUser._id,
              { $addToSet: { skills: skill } },
              { new: true }
            );
          }

          // Verify the skill appears exactly once
          const updatedUser = await User.findById(testUser._id);
          const skillCount = updatedUser.skills.filter(s => s === skill).length;
          
          if (skillCount !== 1) {
            throw new Error(
              `Skill idempotence violated: skill "${skill}" appears ${skillCount} times after adding ${addCount} times (expected 1)`
            );
          }

          // Verify total skills array length is 1
          if (updatedUser.skills.length !== 1) {
            throw new Error(
              `Skills array has unexpected length: ${updatedUser.skills.length} (expected 1)`
            );
          }

          // Cleanup
          await User.findByIdAndDelete(testUser._id);
        }
      ),
      { numRuns: 100 }
    );

    console.log('✓ Skill idempotence test passed! (100 runs)');
    console.log('\n✓ Property verified: Adding a skill multiple times results in exactly one occurrence.');
    
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
