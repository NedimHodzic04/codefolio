/**
 * Feature: dashboard, Property 1: Profile updates persist correctly
 * Validates: Requirements 2.2, 2.4, 9.1, 9.2, 9.3, 9.4
 * 
 * Property: For any authenticated user and valid profile field update (bio, location, socials),
 * submitting the update should result in the database containing the new value and the UI 
 * displaying the new value.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
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
const bioArbitrary = fc.string({ maxLength: 500 });
const locationArbitrary = fc.string({ maxLength: 100 });
const urlArbitrary = fc.oneof(
  fc.constant(''),
  fc.webUrl()
);

const profileUpdateArbitrary = fc.record({
  bio: fc.option(bioArbitrary, { nil: undefined }),
  location: fc.option(locationArbitrary, { nil: undefined }),
});

const socialsUpdateArbitrary = fc.record({
  linkedin: fc.option(urlArbitrary, { nil: undefined }),
  twitter: fc.option(urlArbitrary, { nil: undefined }),
  website: fc.option(urlArbitrary, { nil: undefined }),
});

// Helper to create a test user
const createTestUser = async () => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}`,
    username: `testuser-${Date.now()}`,
    displayName: 'Test User',
    email: 'test@example.com',
    bio: 'Initial bio',
    location: 'Initial location',
    socials: {
      linkedin: '',
      twitter: '',
      website: '',
    },
  });
  await user.save();
  return user;
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Profile updates persist correctly');
  console.log('Feature: dashboard, Property 1');
  console.log('Validates: Requirements 2.2, 2.4, 9.1, 9.2, 9.3, 9.4\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await User.deleteMany({});

    // Test profile updates (bio and location)
    console.log('Testing profile updates (bio and location)...');
    await fc.assert(
      fc.asyncProperty(profileUpdateArbitrary, async (profileUpdate) => {
        const testUser = await createTestUser();
        
        // Prepare update data
        const updateData = {};
        if (profileUpdate.bio !== undefined) updateData.bio = profileUpdate.bio;
        if (profileUpdate.location !== undefined) updateData.location = profileUpdate.location;

        // Perform update
        const updatedUser = await User.findByIdAndUpdate(
          testUser._id,
          updateData,
          { new: true }
        );

        // Verify the update persisted in the returned object
        if (profileUpdate.bio !== undefined) {
          if (updatedUser.bio !== profileUpdate.bio) {
            throw new Error(
              `Bio update failed: expected "${profileUpdate.bio}", got "${updatedUser.bio}"`
            );
          }
        }
        
        if (profileUpdate.location !== undefined) {
          if (updatedUser.location !== profileUpdate.location) {
            throw new Error(
              `Location update failed: expected "${profileUpdate.location}", got "${updatedUser.location}"`
            );
          }
        }

        // Verify the update persisted in the database
        const dbUser = await User.findById(testUser._id);
        
        if (profileUpdate.bio !== undefined) {
          if (dbUser.bio !== profileUpdate.bio) {
            throw new Error(
              `Bio not persisted in DB: expected "${profileUpdate.bio}", got "${dbUser.bio}"`
            );
          }
        }
        
        if (profileUpdate.location !== undefined) {
          if (dbUser.location !== profileUpdate.location) {
            throw new Error(
              `Location not persisted in DB: expected "${profileUpdate.location}", got "${dbUser.location}"`
            );
          }
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
      }),
      { numRuns: 100 }
    );

    console.log('✓ Profile updates test passed! (100 runs)');

    // Test socials updates
    console.log('\nTesting socials updates (LinkedIn, Twitter, website)...');
    await fc.assert(
      fc.asyncProperty(socialsUpdateArbitrary, async (socialsUpdate) => {
        const testUser = await createTestUser();
        
        // Prepare update data
        const updateData = { socials: {} };
        if (socialsUpdate.linkedin !== undefined) updateData.socials.linkedin = socialsUpdate.linkedin;
        if (socialsUpdate.twitter !== undefined) updateData.socials.twitter = socialsUpdate.twitter;
        if (socialsUpdate.website !== undefined) updateData.socials.website = socialsUpdate.website;

        // Perform update
        const updatedUser = await User.findByIdAndUpdate(
          testUser._id,
          updateData,
          { new: true }
        );

        // Verify the update persisted in the returned object
        if (socialsUpdate.linkedin !== undefined) {
          if (updatedUser.socials.linkedin !== socialsUpdate.linkedin) {
            throw new Error(
              `LinkedIn update failed: expected "${socialsUpdate.linkedin}", got "${updatedUser.socials.linkedin}"`
            );
          }
        }
        
        if (socialsUpdate.twitter !== undefined) {
          if (updatedUser.socials.twitter !== socialsUpdate.twitter) {
            throw new Error(
              `Twitter update failed: expected "${socialsUpdate.twitter}", got "${updatedUser.socials.twitter}"`
            );
          }
        }
        
        if (socialsUpdate.website !== undefined) {
          if (updatedUser.socials.website !== socialsUpdate.website) {
            throw new Error(
              `Website update failed: expected "${socialsUpdate.website}", got "${updatedUser.socials.website}"`
            );
          }
        }

        // Verify the update persisted in the database
        const dbUser = await User.findById(testUser._id);
        
        if (socialsUpdate.linkedin !== undefined) {
          if (dbUser.socials.linkedin !== socialsUpdate.linkedin) {
            throw new Error(
              `LinkedIn not persisted in DB: expected "${socialsUpdate.linkedin}", got "${dbUser.socials.linkedin}"`
            );
          }
        }
        
        if (socialsUpdate.twitter !== undefined) {
          if (dbUser.socials.twitter !== socialsUpdate.twitter) {
            throw new Error(
              `Twitter not persisted in DB: expected "${socialsUpdate.twitter}", got "${dbUser.socials.twitter}"`
            );
          }
        }
        
        if (socialsUpdate.website !== undefined) {
          if (dbUser.socials.website !== socialsUpdate.website) {
            throw new Error(
              `Website not persisted in DB: expected "${socialsUpdate.website}", got "${dbUser.socials.website}"`
            );
          }
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
      }),
      { numRuns: 100 }
    );

    console.log('✓ Socials updates test passed! (100 runs)');
    console.log('\n✓ All profile update tests passed!');
    console.log('Profile updates persist correctly in both returned objects and database.');
    
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
