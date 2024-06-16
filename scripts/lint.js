/**
 * Importing npm packages.
 */
import path from 'path';
import { spawnSync } from 'child_process';

/**
 * Importing user defined packages.
 */

/**
 * Declaring the constants.
 */
const isFixEnabled = process.argv.includes('--fix');
const fileGlob = '{packages,scripts}/**/*.ts';
const cwd = path.join(import.meta.dirname, '..');
const options = { cwd, stdio: 'inherit' };

if (isFixEnabled) {
  const prettierResult = spawnSync('pnpm', ['prettier', '--write', fileGlob], options);
  const eslintResult = spawnSync('pnpm', ['eslint', '--fix', fileGlob], options);
  if (prettierResult.status !== 0 || eslintResult.status !== 0) process.exit(1);
} else {
  const prettierResult = spawnSync('pnpm', ['prettier', '-c', '--log-level', 'error', fileGlob], options);
  const eslintResult = spawnSync('pnpm', ['eslint', fileGlob], options);
  if (prettierResult.status !== 0 || eslintResult.status !== 0) process.exit(1);
}
