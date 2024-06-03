/**
 * Importing npm packages
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

/** utility functions */
const formatTime = time => (time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`);
const success = message => console.log('\x1b[32m%s\x1b[0m', message);
const error = message => console.error('\x1b[31m%s\x1b[0m', message);

/** declaring the root and package directories */
const rootDir = path.join(import.meta.dirname, '..');
const distDir = path.join(rootDir, 'dist');
const packagesDir = path.join(rootDir, 'packages');

/** cleaning the previous build */
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

/** building the packages */
const packages = fs.readdirSync(packagesDir).filter(dir => !dir.includes('.'));
for (const name of packages) await buildPackage(name);

/**
 * Function to build the package using esbuild
 * @param {string} name
 * @returns {Promise<void>}
 */
async function buildPackage(name) {
  const startTime = process.hrtime();
  const packageDir = path.join(packagesDir, name);
  const distDir = path.join(rootDir, 'dist', name);
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

  const packageJsonPath = path.join(packageDir, 'package.json');
  const packageJsonString = fs.readFileSync(packageJsonPath);
  const packageJson = JSON.parse(packageJsonString);

  /** modifying package.json and saving to 'dist' */
  const main = name === 'types' ? 'index.d.ts' : 'index.js';
  const distPackageJson = { ...structuredClone(packageJson), main };
  const distPackageJsonString = JSON.stringify(distPackageJson, null, 2);
  fs.writeFileSync(`${distDir}/package.json`, distPackageJsonString);

  /** Copy supporting files into 'dist' */
  fs.copyFileSync(`${packageDir}/README.md`, `${distDir}/README.md`);
  fs.copyFileSync(`${rootDir}/LICENSE`, `${distDir}/LICENSE`);

  /** Building typescript files */
  const args = ['tsc', '--outDir', distDir, '--project', 'tsconfig.build.json'];
  const result = spawnSync('pnpm', args, { cwd: packageDir, stdio: 'inherit' });
  if (result.status !== 0) return error(`Build failed for package '@shadow-library/${name}'`);

  /** Removing temporary files */
  const tsbuildinfo = path.join(distDir, 'tsconfig.build.tsbuildinfo');
  if (fs.existsSync(tsbuildinfo)) fs.rmSync(tsbuildinfo);

  /** Build for commmonJS */
  // const tsconfigPath = path.join(packageDir, 'tsconfig.json');
  // const tsconfigString = fs.readFileSync(tsconfigPath);
  // const tsconfig = JSON.parse(tsconfigString);
  // const entryPoints = tsconfig.include.map(include => path.join(packageDir, include));
  // await esbuild.build({
  //   entryPoints: await glob(entryPoints),
  //   bundle: false,
  //   platform: 'node',
  //   outdir: distDir,
  //   format: 'cjs',
  //   target: 'es2020',
  //   // outExtension: { '.js': '.cjs' },
  //   external: Object.keys(packageJson.dependencies ?? {}),
  // });

  const endTime = process.hrtime(startTime);
  const timeTaken = (endTime[0] * 1e3 + endTime[1] * 1e-6).toFixed(3);
  success(`Built successfull for package '@shadow-library/${name}' in ${formatTime(timeTaken)}`);
}
