import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pkg from '../package.json';
import { rimraf } from 'rimraf';
import child_process from 'node:child_process';

async function* traverseDirectory(dir: string) {
  const pathnames = (await fs.readdir(dir)).map((s) => path.join(dir, s));
  while (pathnames.length > 0) {
    const pathname = pathnames.pop()!;
    const state = await fs.lstat(pathname);
    if (state.isFile()) {
      yield pathname;
    } else if (state.isDirectory()) {
      pathnames.push(
        ...(await fs.readdir(pathname)).map((s) => path.join(pathname, s))
      );
    }
  }
}

const runCommand = async (command: string, args?: string[]) => {
  const child = child_process.spawn(command, args);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  await new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`exit code ${code}`));
      }
    });
  });
};

const sourceDir = `${process.cwd()}/../gkd/build/js/packages/gkd-selector/kotlin`;
const targetDir = `${process.cwd()}/kotlin`;

let modified = false;
for await (const sourcePath of traverseDirectory(sourceDir)) {
  const targetPath = path.join(targetDir, path.relative(sourceDir, sourcePath));
  const sourceText = await fs.readFile(sourcePath);
  const targetText = await fs.readFile(targetPath).catch(() => {});
  if (!targetText || sourceText.compare(targetText) !== 0) {
    modified = true;
    break;
  }
}
if (!modified) {
  console.log('No changes detected');
  process.exit();
}

await rimraf(targetDir);
await fs.cp(sourceDir, targetDir, { recursive: true });
console.log('Copied new files');

const vNum = pkg.version.split('.').map((v) => Number(v));
vNum[vNum.length - 1]++;
const newVersion = vNum.join('.');
pkg.version = newVersion;

await fs.writeFile(
  `${process.cwd()}/package.json`,
  JSON.stringify(pkg, null, 2) + '\n',
  'utf-8'
);
console.log(`Updated to new version ${newVersion}`);

await runCommand('git', ['add', '.']);
await runCommand('git', ['commit', '-m', `Update to version ${newVersion}`]);
