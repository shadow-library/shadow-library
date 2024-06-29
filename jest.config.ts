/**
 * Importing npm packages.
 */
import type { Config } from 'jest';

/**
 * Defining types
 */
type Project = string | { name: string; config: Config };

/**
 * Declaring the constants.
 */
const projects: Project[] = ['app', 'common', 'database', 'errors', 'server'];
const generateProjectConfig = (project: Project): Config => {
  if (typeof project === 'string') project = { name: project, config: {} };
  const configs: Config = { displayName: project.name };

  /** Setting up the test configs */
  configs.rootDir = `packages/${project.name}`;
  configs.transform = { '^.+\\.(t|j)s$': 'ts-jest' };
  configs.moduleNameMapper = { [`@shadow-library/${project.name}/(.*)`]: `<rootDir>/src/$1` };

  /** Setting up the coverage configs */
  configs.coveragePathIgnorePatterns = ['/tests/'];

  return Object.assign(configs, project.config);
};

const config: Config = {
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  detectOpenHandles: true,

  collectCoverage: true,
  coverageReporters: process.env.CI ? ['text'] : ['text-summary', 'html-spa'],
  coverageThreshold: { global: { lines: 90, branches: 85, functions: 90, statements: 90 } },

  projects: projects.map(generateProjectConfig),
};

export default config;
