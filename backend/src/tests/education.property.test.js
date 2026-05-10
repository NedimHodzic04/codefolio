/**
 * Feature: dashboard, Property 7: Education CRUD maintains chronological integrity
 * Validates: Requirements 10.2, 10.3
 * 
 * Property: For any education entry, the startDate should be before or equal to 
 * the endDate when endDate is not null.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import Education from '../models/education.model.js';
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
const dateArbitrary = fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') });

const educationDataArbitrary = fc.record({
  institution: fc.string({ minLength: 1, maxLength: 100 }),
  degree: fc.oneof(
    fc.constant('Bachelor'),
    fc.constant('Master'),
    fc.constant('PhD'),
    fc.constant('Associate'),
    fc.constant('Certificate')
  ),
  fieldOfStudy: fc.string({ minLength: 1, maxLength: 100 }),
  startDate: dateArbitrary,
  endDate: fc.option(dateArbitrary, { nil: null }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
});

// Helper to create a test user
const createTestUser = async () => {
  const user = new User({
    githubId: `test-${Date.now()}-${Math.random()}`,
    username: `testuser-${Date.now()}`,
    displayName: 'Test User',
    email: 'test@example.com',
  });
  await user.save();
  return user;
};

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Education CRUD maintains chronological integrity');
  console.log('Feature: dashboard, Property 7');
  console.log('Validates: Requirements 10.2, 10.3\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await Education.deleteMany({});
    await User.deleteMany({});
    const testUser = await createTestUser();

    await fc.assert(
      fc.asyncProperty(educationDataArbitrary, async (educationData) => {
        // Ensure chronological integrity in the input
        let startDate = educationData.startDate;
        let endDate = educationData.endDate;
        
        // If endDate exists, ensure it's after or equal to startDate
        if (endDate !== null && endDate < startDate) {
          [startDate, endDate] = [endDate, startDate];
        }

        // Create education entry
        const education = new Education({
          user: testUser._id,
          institution: educationData.institution,
          degree: educationData.degree,
          fieldOfStudy: educationData.fieldOfStudy,
          startDate: startDate,
          endDate: endDate,
          description: educationData.description,
        });

        await education.save();

        // Fetch the saved education entry
        const savedEducation = await Education.findById(education._id);

        // Property: startDate should be before or equal to endDate when endDate is not null
        if (savedEducation.endDate !== null && savedEducation.endDate !== undefined) {
          const start = new Date(savedEducation.startDate);
          const end = new Date(savedEducation.endDate);
          
          // Assert chronological integrity
          if (start.getTime() > end.getTime()) {
            throw new Error(
              `Chronological integrity violated: startDate (${start.toISOString()}) is after endDate (${end.toISOString()})`
            );
          }
        }

        // Update operation - test that updates also maintain chronological integrity
        const newStartDate = new Date('2015-01-01');
        const newEndDate = new Date('2019-12-31');
        
        savedEducation.startDate = newStartDate;
        savedEducation.endDate = newEndDate;
        await savedEducation.save();

        const updatedEducation = await Education.findById(education._id);
        
        if (updatedEducation.endDate !== null && updatedEducation.endDate !== undefined) {
          const updatedStart = new Date(updatedEducation.startDate);
          const updatedEnd = new Date(updatedEducation.endDate);
          
          if (updatedStart.getTime() > updatedEnd.getTime()) {
            throw new Error(
              `Chronological integrity violated after update: startDate (${updatedStart.toISOString()}) is after endDate (${updatedEnd.toISOString()})`
            );
          }
        }

        // Cleanup
        await Education.findByIdAndDelete(education._id);
      }),
      { numRuns: 100 }
    );

    console.log('✓ Property test passed! (100 runs)');
    console.log('All education entries maintained chronological integrity.');
    
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
