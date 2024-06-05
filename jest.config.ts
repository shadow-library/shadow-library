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
  projects: [
    {
      displayName: '@shadow-library/errors',
      transform,
      rootDir: 'packages/errors',
    },
    {
      displayName: '@shadow-library/common',
      transform,
      rootDir: 'packages/common',
      moduleNameMapper: { '@shadow-library/common/(.*)': '<rootDir>/src/$1' },
    },
  ],
};

export default config;
