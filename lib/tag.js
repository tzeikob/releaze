const fs = require('fs');
const semver = require('semver');
const exec = require('./util/exec');
const ExecError = require('./errors/exec-error');
const { isNotSemver, isGiven, isNotString } = require('./util/validators');

const { access } = fs.promises;

async function tag (version, message) {
  if (isNotSemver(version)) {
    throw new Error(`Invalid or missing semver version argument: ${String(version)}`);
  }

  if (isGiven(message) && isNotString(message)) {
    throw new Error(`Invalid non string message argument: ${String(message)}`);
  }

  await exec('git', ['add', 'package.json']);

  try {
    await access('CHANGELOG.md');
    await exec('git', ['add', 'CHANGELOG.md']);
  } catch (error) {
    // Ignore error if file doesn't exist
    if (error instanceof ExecError) {
      throw error;
    }
  }

  try {
    await access('package-lock.json');
    await exec('git', ['add', 'package-lock.json']);
  } catch (error) {
    // Ignore error if file doesn't exist
    if (error instanceof ExecError) {
      throw error;
    }
  }

  try {
    await access('npm-shrinkwrap.json');
    await exec('git', ['add', 'npm-shrinkwrap.json']);
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