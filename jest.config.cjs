/**
 * Importing npm packages.
 */

/**
 * Importing user defined packages.
 */

/**
 * Declaring the constants.
 */
const transform = { '^.+\\.(t|j)s$': 'ts-jest' };

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  detectOpenHandles: true,
  rootDir: '.',
  projects: [{ displayName: '@shadow-library/errors', transform }],
};

module.exports = config;
