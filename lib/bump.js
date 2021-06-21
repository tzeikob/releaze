const fs = require('fs');
const path = require('path');
const semver = require('semver');
const BumpError = require('./errors/bump-error');
const { isNotSemverReleaseType, isGiven, isNotString } = require('./util/validators');

const { readFile, writeFile } = fs.promises;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');
const pathToPackageLockJSON = path.join(process.cwd(), 'package-lock.json');
const pathToShrinkwrapJSON = path.join(process.cwd(), 'npm-shrinkwrap.json');

async function read (filepath) {
  const content = await readFile(filepath, 'utf8');

  const obj = JSON.parse(content);

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new BumpError('Invalid or malformed JSON file', filepath);
  }

  if (!obj.version || !semver.valid(obj.version)) {
    throw new BumpError('Invalid or missing semver version in JSON file', filepath);
  }

  return obj;
}

async function write (filepath, obj) {
  const content = JSON.stringify(obj, null, 2);

  await writeFile(filepath, `${content}\n`);
}

async function bump (type, preid) {
  if (isNotSemverReleaseType(type)) {
    throw new BumpError('Invalid or missing semver release type argument', type);
  }

  if (isGiven(preid) && isNotString(preid)) {
    throw new BumpError('Invalid non string preid key for a pre based bump', preid);
  }

  const pkg = await read(pathToPackageJSON);

  const previous = pkg.version;
  const current = semver.inc(previous, type, preid);

  pkg.version = current;
  await write(pathToPackageJSON, pkg);

  try {
    const pkgLock = await read(pathToPackageLockJSON);
    pkgLock.version = current;
    await write(pathToPackageLockJSON, pkgLock);
  } catch (error) {
    // Ignore exception only if package lock file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  try {
    const shrinkwrap = await read(pathToShrinkwrapJSON);
    shrinkwrap.version = current;
    await write(pathToShrinkwrapJSON, shrinkwrap);
  } catch(error) {
    // Ignore exception only if shrinkwrap file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return { previous, current };
}

module.exports = bump;