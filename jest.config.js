/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.js'],
    testMatch: ['<rootDir>/spec/**/*.spec.js'],
    testPathIgnorePatterns: ['<rootDir>/tests/'],
};
