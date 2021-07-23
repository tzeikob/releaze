'use strict';

const semver = require('semver');
const exec = require('../util/exec');
const { isNotSemver } = require('../util/validators');

async function tag (version, message) {
  if (isNotSemver(version)) {
    throw new Error(`Invalid or missing semver version argument: ${version}`);
  }

  await exec('git', ['add', 'package.json']);

  try {
    await exec('git', ['add', 'CHANGELOG.md']);
  } catch (error) {}

  try {
    await exec('git', ['add', 'package-lock.json']);
  } catch (error) {}

  try {
    await exec('git', ['add', 'npm-shrinkwrap.json']);
  } catch (error) {}

  version = semver.clean(version);
  message = message ?? 'Bump to v%s';
  message = message.replace(/%s/g, version);

  await exec('git', ['commit', '-m', message]);
  await exec('git', ['tag', '-a', `v${version}`, '-m', message]);
}

module.exports = tag;