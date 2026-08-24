module.exports = {
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  // Load .env.test with override BEFORE any test code runs.
  // This ensures tests hit geest_task_db_test, not production.
  setupFiles: ['<rootDir>/tests/setup.js'],
  maxWorkers: 1,
  testTimeout: 30000,
  forceExit: true,
};
