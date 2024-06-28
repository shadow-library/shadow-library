/**
 * Importing npm packages.
 */
import type { Config } from 'jest';

/**
 * Declaring the constants.
 */
const transform: Config['transform'] = { '^.+\\.(t|j)s$': 'ts-jest' };

const config: Config = {
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  detectOpenHandles: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'html-spa'],
  // coverageThreshold: { global: { branches: 90, functions: 90, lines: 90, statements: 90 } },
  projects: [
    {
      displayName: '@shadow-library/app',
      transform,
      rootDir: 'packages/app',
      moduleNameMapper: { '@shadow-library/app/(.*)': '<rootDir>/src/$1' },
    },
    {
      displayName: '@shadow-library/common',
      transform,
      rootDir: 'packages/common',
      moduleNameMapper: { '@shadow-library/common/(.*)': '<rootDir>/src/$1' },
    },
    {
      displayName: '@shadow-library/database',
      transform,
      rootDir: 'packages/database',
      moduleNameMapper: { '@shadow-library/database/(.*)': '<rootDir>/src/$1' },
    },
    {
      displayName: '@shadow-library/errors',
      transform,
      rootDir: 'packages/errors',
    },
    {
      displayName: '@shadow-library/server',
      transform,
      rootDir: 'packages/server',
    },
  ],
};

export default config;
