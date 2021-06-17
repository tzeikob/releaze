const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { isNotSemverReleaseType } = require('./util/validators');

const { readFile, writeFile } = fs.promises;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');

async function bump (type) {
  if (isNotSemverReleaseType(type)) {
    throw new Error('Invalid or missing semver release type argument');
  }

  const content = await readFile(pathToPackageJSON, 'utf8');
  const pkg = JSON.parse(content);

  if (typeof pkg !== 'object' || pkg === null || Array.isArray(pkg)) {
    throw new Error('Invalid or malformed package.json');
  }

  if (!pkg.version || !semver.valid(pkg.version)) {
    throw new Error('Invalid or missing semver version in package.json');
  }

  const previous = pkg.version;
  const current = semver.inc(previous, type);

  pkg.version = current;

  const newContent = JSON.stringify(pkg, null, 2);

  await writeFile(pathToPackageJSON, `${newContent}\n`);

  return { previous, current };
}

module.exports = bump;