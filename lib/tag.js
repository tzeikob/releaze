const fs = require('fs');
const path = require('path');
const semver = require('semver');
const exec = require('./util/exec');
const ExecError = require('./errors/exec-error');
const { isNotSemver, isGiven, isNotString } = require('./util/validators');

const { access } = fs.promises;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');
const pathToChangelogMD = path.join(process.cwd(), 'CHANGELOG.md');
const pathToPackageLockJSON = path.join(process.cwd(), 'package-lock.json');
const pathToShrinkwrapJSON = path.join(process.cwd(), 'npm-shrinkwrap.json');

async function tag (version, message) {
  if (isNotSemver(version)) {
    throw new Error(`Invalid or missing semver version argument: ${String(version)}`);
  }

  if (isGiven(message) && isNotString(message)) {
    throw new Error(`Invalid non string message argument: ${String(message)}`);
  }

  await exec('git', ['add', pathToPackageJSON]);

  try {
    await access(pathToChangelogMD);
    await exec('git', ['add', pathToChangelogMD]);
  } catch (error) {
    // Ignore error if file doesn't exist
    if (error instanceof ExecError) {
      throw error;
    }
  }

  try {
    await access(pathToPackageLockJSON);
    await exec('git', ['add', pathToPackageLockJSON]);
  } catch (error) {
    // Ignore error if file doesn't exist
    if (error instanceof ExecError) {
      throw error;
    }
  }

  try {
    await access(pathToShrinkwrapJSON);
    await exec('git', ['add', pathToShrinkwrapJSON]);
  } catch (error) {
    // Ignore error if file doesn't exist
    if (error instanceof ExecError) {
      throw error;
    }
  }

  version = semver.clean(version);
  message = message ?? 'Bump to v%s';
  message = message.replace(/%s/g, version);

  await exec('git', ['commit', '-m', message]);
  await exec('git', ['tag', '-a', `v${version}`, '-m', message]);
}

module.exports = tag;