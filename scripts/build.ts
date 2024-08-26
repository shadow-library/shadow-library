/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const rootDir = path.join(import.meta.dirname, '..');
const distDir = path.join(rootDir, 'dist');
const packagesDir = path.join(rootDir, 'packages');

const formatTime = (time: number) => (time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(3)}s`);
const success = (message: string) => console.log('\x1b[32m%s\x1b[0m', message); // eslint-disable-line no-console
const error = (message: string) => console.error('\x1b[31m%s\x1b[0m', message); // eslint-disable-line no-console

/** cleaning the previous build */
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

/** building the packages */
const packages = fs.readdirSync(packagesDir).filter(dir => fs.statSync(path.join(packagesDir, dir)).isDirectory());
for (const name of packages) await buildPackage(name);

async function buildPackage(name: string): Promise<void> {
  const startTime = process.hrtime();
  const packageDir = path.join(packagesDir, name);
  const distDir = path.join(rootDir, 'dist', 'packages', name);
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const packageJsonPath = path.join(packageDir, 'package.json');
  const packageJsonString = fs.readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonString);

  /** modifying package.json and saving to 'dist' */
  const distPackageJson = { ...structuredClone(packageJson), main: 'index.js' };
  const distPackageJsonString = JSON.stringify(distPackageJson, null, 2);
  fs.writeFileSync(`${distDir}/package.json`, distPackageJsonString);

  /** Copy supporting files into 'dist' */
  fs.copyFileSync(`${packageDir}/README.md`, `${distDir}/README.md`);
  fs.copyFileSync(`${rootDir}/LICENSE`, `${distDir}/LICENSE`);

  /** Building typescript files */
  const tsc = ['tsc', '--outDir', distDir, '--project', 'tsconfig.build.json'];
  const tscAlias = ['tsc-alias', '--outDir', distDir, '--project', 'tsconfig.build.json'];
  let result = spawnSync('pnpm', tsc, { cwd: packageDir, stdio: 'inherit' });
  if (result.status === 0) result = spawnSync('pnpm', tscAlias, { cwd: packageDir, stdio: 'inherit' });
  if (result.status !== 0) return error(`Build failed for package '@shadow-library/${name}'`);

  /** Removing temporary files */
  const tsbuildinfo = path.join(distDir, 'tsconfig.build.tsbuildinfo');
  if (fs.existsSync(tsbuildinfo)) fs.rmSync(tsbuildinfo);

  const endTime = process.hrtime(startTime);
  const timeTaken = endTime[0] * 1e3 + endTime[1] * 1e-6;
  success(`Built successfull for package '@shadow-library/${name}' in ${formatTime(timeTaken)}`);
}
