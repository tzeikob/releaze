'use strict';

const semver = require('semver');
const exec = require('../util/exec');
const { isNotSemver } = require('../util/validators');

const hashRegex = /[0-9a-f]{7}/;

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

  const stdout = await exec('git', ['commit', '-m', message]);

  const hash = stdout.match(hashRegex)[0];

  const name = `v${version}`;

  await exec('git', ['tag', '-a', name, '-m', message]);

  return { name, hash };
}

module.exports = tag;