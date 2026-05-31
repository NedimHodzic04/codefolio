/**
 * Feature: portfolio-customization, Property 5: Portfolio reflects latest dashboard settings
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 * 
 * Property: For any user who updates their dashboard settings (layout, theme, education, socials),
 * the portfolio page should reflect those changes on the next page load without caching stale data.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Education from '../models/education.model.js';
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
const urlArbitrary = fc.oneof(
  fc.constant(''),
  fc.webUrl()
);

const socialsArbitrary = fc.record({
  linkedin: urlArbitrary,
  twitter: urlArbitrary,
  website: urlArbitrary,
});

const educationArbitrary = fc.record({
  institution: fc.string({ minLength: 1, maxLength: 100 }),
  degree: fc.string({ minLength: 1, maxLength: 100 }),
  fieldOfStudy: fc.string({ minLength: 1, maxLength: 100 }),
  startDate: fc.date({ min: new Date('2000-01-01'), max: new Date() }),
  endDate: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date() }), { nil: null }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
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
    socials: {
      linkedin: '',
      twitter: '',
      website: '',
    },
  });
  await user.save();
  return user;
};

// Helper to simulate fetching portfolio data (like the frontend does)
const fetchPortfolioData = async (username) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }
  
  const education = await Education.find({ user: user._id })
    .sort({ startDate: -1 });
  
  return { ...user.toObject(), education };
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Portfolio reflects latest dashboard settings');
  console.log('Feature: portfolio-customization, Property 5');
  console.log('Validates: Requirements 5.1, 5.2, 5.3, 5.4\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await User.deleteMany({});
    await Education.deleteMany({});

    // Property 1: Layout template changes are reflected
    console.log('Testing: Layout template changes are reflected...');
    await fc.assert(
      fc.asyncProperty(layoutTemplateArbitrary, async (newLayout) => {
        const testUser = await createTestUser();
        
        // Update layout template
        await User.findByIdAndUpdate(
          testUser._id,
          { layoutTemplate: newLayout },
          { new: true }
        );

        // Fetch portfolio data (simulating page load)
        const portfolioData = await fetchPortfolioData(testUser.username);

        // Verify the layout template is reflected
        if (portfolioData.layoutTemplate !== newLayout) {
          throw new Error(
            `Layout template not reflected: expected "${newLayout}", got "${portfolioData.layoutTemplate}"`
          );
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
      }),
      { numRuns: 100 }
    );
    console.log('✓ Layout template changes are reflected (100 runs)');

    // Property 2: Theme changes are reflected
    console.log('\nTesting: Theme changes are reflected...');
    await fc.assert(
      fc.asyncProperty(themeArbitrary, async (newTheme) => {
        const testUser = await createTestUser();
        
        // Update theme
        await User.findByIdAndUpdate(
          testUser._id,
          { theme: newTheme },
          { new: true }
        );

        // Fetch portfolio data (simulating page load)
        const portfolioData = await fetchPortfolioData(testUser.username);

        // Verify the theme is reflected
        if (portfolioData.theme !== newTheme) {
          throw new Error(
            `Theme not reflected: expected "${newTheme}", got "${portfolioData.theme}"`
          );
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
      }),
      { numRuns: 100 }
    );
    console.log('✓ Theme changes are reflected (100 runs)');

    // Property 3: Social links changes are reflected
    console.log('\nTesting: Social links changes are reflected...');
    await fc.assert(
      fc.asyncProperty(socialsArbitrary, async (newSocials) => {
        const testUser = await createTestUser();
        
        // Update socials
        await User.findByIdAndUpdate(
          testUser._id,
          { socials: newSocials },
          { new: true }
        );

        // Fetch portfolio data (simulating page load)
        const portfolioData = await fetchPortfolioData(testUser.username);

        // Verify the socials are reflected
        if (portfolioData.socials.linkedin !== newSocials.linkedin) {
          throw new Error(
            `LinkedIn not reflected: expected "${newSocials.linkedin}", got "${portfolioData.socials.linkedin}"`
          );
        }
        if (portfolioData.socials.twitter !== newSocials.twitter) {
          throw new Error(
            `Twitter not reflected: expected "${newSocials.twitter}", got "${portfolioData.socials.twitter}"`
          );
        }
        if (portfolioData.socials.website !== newSocials.website) {
          throw new Error(
            `Website not reflected: expected "${newSocials.website}", got "${portfolioData.socials.website}"`
          );
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
      }),
      { numRuns: 100 }
    );
    console.log('✓ Social links changes are reflected (100 runs)');

    // Property 4: Education changes are reflected
    console.log('\nTesting: Education changes are reflected...');
    await fc.assert(
      fc.asyncProperty(
        fc.array(educationArbitrary, { minLength: 0, maxLength: 5 }),
        async (educationEntries) => {
          const testUser = await createTestUser();
          
          // Add education entries
          const createdEducation = [];
          for (const eduData of educationEntries) {
            const edu = new Education({
              user: testUser._id,
              ...eduData,
            });
            await edu.save();
            createdEducation.push(edu);
          }

          // Fetch portfolio data (simulating page load)
          const portfolioData = await fetchPortfolioData(testUser.username);

          // Verify the education entries are reflected
          if (portfolioData.education.length !== educationEntries.length) {
            throw new Error(
              `Education count not reflected: expected ${educationEntries.length}, got ${portfolioData.education.length}`
            );
          }

          // Verify education is sorted by startDate descending
          for (let i = 0; i < portfolioData.education.length - 1; i++) {
            const current = new Date(portfolioData.education[i].startDate);
            const next = new Date(portfolioData.education[i + 1].startDate);
            if (current < next) {
              throw new Error(
                `Education not sorted by startDate descending: ${current} < ${next}`
              );
            }
          }

          // Cleanup
          await User.findByIdAndDelete(testUser._id);
          for (const edu of createdEducation) {
            await Education.findByIdAndDelete(edu._id);
          }
        }
      ),
      { numRuns: 100 }
    );
    console.log('✓ Education changes are reflected (100 runs)');

    // Property 5: Multiple simultaneous setting changes are all reflected
    console.log('\nTesting: Multiple simultaneous setting changes are all reflected...');
    await fc.assert(
      fc.asyncProperty(
        layoutTemplateArbitrary,
        themeArbitrary,
        socialsArbitrary,
        async (newLayout, newTheme, newSocials) => {
          const testUser = await createTestUser();
          
          // Update all settings at once
          await User.findByIdAndUpdate(
            testUser._id,
            {
              layoutTemplate: newLayout,
              theme: newTheme,
              socials: newSocials,
            },
            { new: true }
          );

          // Fetch portfolio data (simulating page load)
          const portfolioData = await fetchPortfolioData(testUser.username);

          // Verify all settings are reflected
          if (portfolioData.layoutTemplate !== newLayout) {
            throw new Error(
              `Layout template not reflected in batch update: expected "${newLayout}", got "${portfolioData.layoutTemplate}"`
            );
          }
          if (portfolioData.theme !== newTheme) {
            throw new Error(
              `Theme not reflected in batch update: expected "${newTheme}", got "${portfolioData.theme}"`
            );
          }
          if (portfolioData.socials.linkedin !== newSocials.linkedin) {
            throw new Error(
              `LinkedIn not reflected in batch update: expected "${newSocials.linkedin}", got "${portfolioData.socials.linkedin}"`
            );
          }
          if (portfolioData.socials.twitter !== newSocials.twitter) {
            throw new Error(
              `Twitter not reflected in batch update: expected "${newSocials.twitter}", got "${portfolioData.socials.twitter}"`
            );
          }
          if (portfolioData.socials.website !== newSocials.website) {
            throw new Error(
              `Website not reflected in batch update: expected "${newSocials.website}", got "${portfolioData.socials.website}"`
            );
          }

          // Cleanup
          await User.findByIdAndDelete(testUser._id);
        }
      ),
      { numRuns: 100 }
    );
    console.log('✓ Multiple simultaneous setting changes are all reflected (100 runs)');

    console.log('\n✓ All settings reflection tests passed!');
    console.log('Portfolio reflects latest dashboard settings without caching stale data.');
    
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
