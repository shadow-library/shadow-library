/**
 * Importing npm packages
 */
import { SpawnSyncOptions, spawnSync } from 'child_process';
import { join } from 'path';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const isFixEnabled = process.argv.includes('--fix');
const fileGlob = '{packages,scripts}/**/*.ts';
const cwd = join(import.meta.dirname, '..');
const options = { cwd, stdio: 'inherit' } satisfies SpawnSyncOptions;

if (isFixEnabled) {
  const prettierResult = spawnSync('pnpm', ['prettier', '--write', '--log-level', 'error', fileGlob], options);
  const eslintResult = spawnSync('pnpm', ['eslint', '--fix', fileGlob], options);
  if (prettierResult.status !== 0 || eslintResult.status !== 0) process.exit(1);
} else {
  const prettierResult = spawnSync('pnpm', ['prettier', '-c', '--log-level', 'error', fileGlob], options);
  const eslintResult = spawnSync('pnpm', ['eslint', fileGlob], options);
  if (prettierResult.status !== 0 || eslintResult.status !== 0) process.exit(1);
}
