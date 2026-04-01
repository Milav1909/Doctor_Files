/**
 * Jest Global Setup
 * -----------------
 * Sets up mock environment variables and global mocks
 * required by all test suites.
 */

// Set test environment variables before anything else
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';
process.env.MONGODB_URI = 'mongodb://localhost:27017/doctorfiles_test';

// Suppress console.error noise during tests
jest.spyOn(console, 'error').mockImplementation(() => {});
