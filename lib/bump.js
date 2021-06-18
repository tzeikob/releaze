const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { isNotSemverReleaseType } = require('./util/validators');

const { existsSync } = fs;
const { readFile, writeFile } = fs.promises;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');
const pathToPackageLockJSON = path.join(process.cwd(), 'package-lock.json');
const pathToShrinkwrapJSON = path.join(process.cwd(), 'npm-shrinkwrap.json');

async function bump (type) {
  if (isNotSemverReleaseType(type)) {
    throw new Error('Invalid or missing semver release type argument');
  }

  const pkgContent = await readFile(pathToPackageJSON, 'utf8');
  const pkg = JSON.parse(pkgContent);

  if (typeof pkg !== 'object' || pkg === null || Array.isArray(pkg)) {
    throw new Error('Invalid or malformed package.json');
  }

  if (!pkg.version || !semver.valid(pkg.version)) {
    throw new Error('Invalid or missing semver version in package.json');
  }

  const previous = pkg.version;
  const current = semver.inc(previous, type);

  pkg.version = current;

  const newPkgContent = JSON.stringify(pkg, null, 2);
  await writeFile(pathToPackageJSON, `${newPkgContent}\n`);

  if (existsSync(pathToPackageLockJSON)) {
    const pkgLockContent = await readFile(pathToPackageLockJSON);
    pkgLock = JSON.parse(pkgLockContent);
    pkgLock.version = current;

    const newPkgLockContent = JSON.stringify(pkgLock, null, 2);
    await writeFile(pathToPackageLockJSON, `${newPkgLockContent}\n`);
  }

  if (existsSync(pathToShrinkwrapJSON)) {
    const shrinkwrapContent = await readFile(pathToShrinkwrapJSON);
    shrinkwrap = JSON.parse(shrinkwrapContent);
    shrinkwrap.version = current;

    const newShrinkwrapContent = JSON.stringify(shrinkwrap, null, 2);
    await writeFile(pathToShrinkwrapJSON, `${newShrinkwrapContent}\n`);
  }

  return { previous, current };
}

module.exports = bump;