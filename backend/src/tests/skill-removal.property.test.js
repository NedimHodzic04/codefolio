/**
 * Feature: dashboard, Property 3: Skill removal is complete
 * Validates: Requirements 3.2, 3.3
 * 
 * Property: For any skill in the user's skill list, removing it should result in the skill 
 * no longer appearing in the list or database.
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

// Helper to create a test user with skills
const createTestUserWithSkills = async (skills) => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}`,
    username: `testuser-${Date.now()}`,
    displayName: 'Test User',
    email: 'test@example.com',
    skills: skills,
  });
  await user.save();
  return user;
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Skill removal is complete');
  console.log('Feature: dashboard, Property 3');
  console.log('Validates: Requirements 3.2, 3.3\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await User.deleteMany({});

    console.log('Testing skill removal completeness...');
    await fc.assert(
      fc.asyncProperty(
        fc.array(skillArbitrary, { minLength: 1, maxLength: 10 }).map(arr => [...new Set(arr)]), // Unique skills
        fc.integer({ min: 0, max: 9 }), // Index of skill to remove
        async (skills, removeIndex) => {
          // Ensure we have a valid index
          const actualRemoveIndex = removeIndex % skills.length;
          const skillToRemove = skills[actualRemoveIndex];
          
          const testUser = await createTestUserWithSkills(skills);
          
          // Remove the skill
          await User.findByIdAndUpdate(
            testUser._id,
            { $pull: { skills: skillToRemove } },
            { new: true }
          );

          // Verify the skill is no longer in the database
          const updatedUser = await User.findById(testUser._id);
          
          if (updatedUser.skills.includes(skillToRemove)) {
            throw new Error(
              `Skill removal incomplete: skill "${skillToRemove}" still appears in the skills list after removal`
            );
          }

          // Verify all other skills are still present
          const remainingExpectedSkills = skills.filter(s => s !== skillToRemove);
          for (const expectedSkill of remainingExpectedSkills) {
            if (!updatedUser.skills.includes(expectedSkill)) {
              throw new Error(
                `Skill removal affected other skills: expected skill "${expectedSkill}" is missing`
              );
            }
          }

          // Verify the count is correct
          if (updatedUser.skills.length !== remainingExpectedSkills.length) {
            throw new Error(
              `Skills array has unexpected length: ${updatedUser.skills.length} (expected ${remainingExpectedSkills.length})`
            );
          }

          // Cleanup
          await User.findByIdAndDelete(testUser._id);
        }
      ),
      { numRuns: 100 }
    );

    console.log('✓ Skill removal test passed! (100 runs)');
    console.log('\n✓ Property verified: Removing a skill completely removes it from the list without affecting other skills.');
    
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
