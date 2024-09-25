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
const projects: Project[] = ['app', 'common', 'server'];
const generateProjectConfig = (project: Project): Config => {
  if (typeof project === 'string') project = { name: project, config: {} };
  const configs: Config = { displayName: project.name };

  /** Setting up the test configs */
  configs.rootDir = `packages/${project.name}`;
  configs.transform = { '^.+\\.ts$': ['ts-jest', { isolatedModules: false }] };
  configs.moduleNameMapper = { [`@shadow-library/${project.name}/(.*)`]: `<rootDir>/src/$1` };

  return Object.assign(configs, project.config);
};

const config: Config = {
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  detectOpenHandles: true,

  collectCoverage: true,
  coverageReporters: process.env.CI ? ['text'] : ['text-summary', 'html-spa'],
  coverageThreshold: { global: { lines: 100, branches: 100, functions: 100, statements: 100 } },
  coveragePathIgnorePatterns: ['node_modules'],

  projects: projects.map(generateProjectConfig),
};

export default config;
