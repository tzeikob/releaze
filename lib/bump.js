const fs = require('fs');
const semver = require('semver');
const { isNotSemverReleaseType } = require('./util/validators');

const { readFile, writeFile } = fs.promises;

async function read (filepath) {
  const content = await readFile(filepath, 'utf8');

  const obj = JSON.parse(content);

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error(`Invalid or malformed JSON file: ${filepath}`);
  }

  if (!obj.version || !semver.valid(obj.version)) {
    throw new Error(`Invalid or missing semver version in JSON file: ${filepath}`);
  }

  return obj;
}

async function write (filepath, obj) {
  const content = JSON.stringify(obj, null, 2);

  await writeFile(filepath, `${content}\n`);
}

async function bump (type, preid) {
  if (isNotSemverReleaseType(type)) {
    throw new Error(`Invalid or missing semver release type argument: ${type}`);
  }

  const pkg = await read('package.json');

  const current = semver.clean(pkg.version);
  const next = semver.inc(current, type, preid);

  pkg.version = next;
  await write('package.json', pkg);

  try {
    const pkgLock = await read('package-lock.json');

    pkgLock.version = next;
    await write('package-lock.json', pkgLock);
  } catch (error) {
    // Ignore exception only if package lock file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  try {
    const shrinkwrap = await read('npm-shrinkwrap.json');

    shrinkwrap.version = next;
    await write('npm-shrinkwrap.json', shrinkwrap);
  } catch(error) {
    // Ignore exception only if shrinkwrap file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const isPrerelease = /\b(premajor|preminor|prepatch|prerelease)/.test(type);

  return { current, next, isPrerelease };
}

module.exports = bump;