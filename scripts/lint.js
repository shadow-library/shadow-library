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
  spawnSync('pnpm', ['prettier', '--write', fileGlob], options);
  spawnSync('pnpm', ['eslint', '--fix', fileGlob], options);
} else {
  spawnSync('pnpm', ['prettier', '-c', '--log-level', 'error', fileGlob], options);
  spawnSync('pnpm', ['eslint', fileGlob], options);
}
