/**
 * Feature: dashboard, Property 9: Unauthenticated access is blocked
 * Validates: Requirements 1.3
 * 
 * Property: For any dashboard API endpoint, requests without a valid session
 * should return 401 Unauthorized and not modify any data.
 */

import fc from 'fast-check';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import checkAuth from '../middleware/auth.js';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';
import Education from '../models/education.model.js';

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

// Mock request/response objects
const createMockRequest = (isAuthenticated) => ({
  isAuthenticated: () => isAuthenticated,
  user: isAuthenticated ? { id: 'test-user' } : null,
});

const createMockResponse = () => {
  const res = {
    statusCode: null,
    jsonData: null,
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

// Arbitrary for authentication status
const authStatusArbitrary = fc.boolean();

// Main test function
const runPropertyTest = async () => {
  console.log('Starting Property Test: Unauthenticated access is blocked');
  console.log('Feature: dashboard, Property 9');
  console.log('Validates: Requirements 1.3\n');

  await connectTestDB();
  
  try {
    // Clean up before test
    await User.deleteMany({});
    await Project.deleteMany({});
    await Education.deleteMany({});

    console.log('Testing authentication middleware behavior...');
    
    // Count initial documents
    const initialUserCount = await User.countDocuments();
    const initialProjectCount = await Project.countDocuments();
    const initialEducationCount = await Education.countDocuments();

    await fc.assert(
      fc.asyncProperty(authStatusArbitrary, async (isAuthenticated) => {
        const req = createMockRequest(isAuthenticated);
        const res = createMockResponse();
        let nextCalled = false;
        const next = () => { nextCalled = true; };

        // Call the authentication middleware
        checkAuth(req, res, next);

        if (isAuthenticated) {
          // If authenticated, next() should be called
          if (!nextCalled) {
            throw new Error('Expected next() to be called for authenticated request');
          }
          if (res.statusCode !== null) {
            throw new Error('Expected no response for authenticated request');
          }
        } else {
          // If not authenticated, should return 401
          if (nextCalled) {
            throw new Error('Expected next() NOT to be called for unauthenticated request');
          }
          if (res.statusCode !== 401) {
            throw new Error(
              `Expected 401 for unauthenticated request, got ${res.statusCode}`
            );
          }
          if (!res.jsonData || !res.jsonData.message) {
            throw new Error('Expected error message in response');
          }
        }

        // Verify no data was modified
        const finalUserCount = await User.countDocuments();
        const finalProjectCount = await Project.countDocuments();
        const finalEducationCount = await Education.countDocuments();

        if (finalUserCount !== initialUserCount) {
          throw new Error(
            `User data was modified: initial ${initialUserCount}, final ${finalUserCount}`
          );
        }

        if (finalProjectCount !== initialProjectCount) {
          throw new Error(
            `Project data was modified: initial ${initialProjectCount}, final ${finalProjectCount}`
          );
        }

        if (finalEducationCount !== initialEducationCount) {
          throw new Error(
            `Education data was modified: initial ${initialEducationCount}, final ${finalEducationCount}`
          );
        }
      }),
      { numRuns: 100 }
    );

    console.log('✓ Authentication middleware test passed! (100 runs)');
    console.log('\n✓ All authentication blocking tests passed!');
    console.log('Authentication middleware correctly blocks unauthenticated requests with 401.');
    
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
