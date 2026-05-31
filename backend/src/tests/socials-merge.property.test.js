/**
 * Feature: dashboard, Property: Partial social link updates merge with existing values
 *
 * Property: Updating one social field must not clear the other saved fields.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const connectTestDB = async () => {
  const testMongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(testMongoUri);
};

const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

const urlArbitrary = fc.oneof(
  fc.constant(''),
  fc.webUrl(),
);

const socialsArbitrary = fc.record({
  linkedin: urlArbitrary,
  twitter: urlArbitrary,
  website: urlArbitrary,
});

const socialFieldArbitrary = fc.constantFrom('linkedin', 'twitter', 'website');

function mergeSocials(existing, updates) {
  const merged = {
    linkedin: existing?.linkedin ?? '',
    twitter: existing?.twitter ?? '',
    website: existing?.website ?? '',
  };

  if (updates.linkedin !== undefined) merged.linkedin = updates.linkedin;
  if (updates.twitter !== undefined) merged.twitter = updates.twitter;
  if (updates.website !== undefined) merged.website = updates.website;

  return merged;
}

const createTestUser = async (socials) => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}`,
    username: `testuser-${Date.now()}-${Math.random()}`,
    displayName: 'Test User',
    email: 'test@example.com',
    socials,
  });
  await user.save();
  return user;
};

const runPropertyTest = async () => {
  console.log('Starting Property Test: Partial social link updates merge correctly\n');

  await connectTestDB();

  try {
    await User.deleteMany({});

    await fc.assert(
      fc.asyncProperty(
        socialsArbitrary,
        socialFieldArbitrary,
        urlArbitrary,
        async (initialSocials, fieldToUpdate, newValue) => {
          const testUser = await createTestUser(initialSocials);
          const partialUpdate = { [fieldToUpdate]: newValue };
          const mergedSocials = mergeSocials(testUser.socials, partialUpdate);

          const updatedUser = await User.findByIdAndUpdate(
            testUser._id,
            { $set: { socials: mergedSocials } },
            { new: true },
          );

          for (const field of ['linkedin', 'twitter', 'website']) {
            const expected =
              field === fieldToUpdate ? newValue : (initialSocials[field] ?? '');

            if (updatedUser.socials[field] !== expected) {
              throw new Error(
                `Merge failed for "${field}" when updating "${fieldToUpdate}". ` +
                  `Expected "${expected}", got "${updatedUser.socials[field]}"`,
              );
            }
          }

          await User.findByIdAndDelete(testUser._id);
        },
      ),
      { numRuns: 100 },
    );

    console.log('✓ Partial social link updates merge correctly (100 runs)\n');
  } catch (error) {
    console.error('✗ Property test failed!');
    console.error(error.message);
    throw error;
  } finally {
    await disconnectTestDB();
  }
};

runPropertyTest()
  .then(() => {
    console.log('Test completed successfully.');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
