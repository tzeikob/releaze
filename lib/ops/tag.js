'use strict';

const semver = require('semver');
const exec = require('../util/exec');
const logger = require('../util/logger');
const { isNotSemver } = require('../util/validators');

const hashRegex = /[0-9a-f]{7}/;

async function tag (version, message) {
  if (isNotSemver(version)) {
    throw new Error(`Invalid or missing semver version argument: ${version}`);
  }

  await exec('git', ['add', 'package.json']);

  logger.verbose(' File package.json has been staged');

  try {
    await exec('git', ['add', 'CHANGELOG.md']);

    logger.verbose(' File CHANGELOG.md has been staged');
  } catch (error) {}

  try {
    await exec('git', ['add', 'package-lock.json']);

    logger.verbose(' File package-lock.json has been staged');
  } catch (error) {}

  try {
    await exec('git', ['add', 'npm-shrinkwrap.json']);

    logger.verbose(' File npm-shrinkwrap.json has been staged');
  } catch (error) {}

  version = semver.clean(version);
  message = message ?? 'Bump to v%s';
  message = message.replace(/%s/g, version);

  const stdout = await exec('git', ['commit', '-m', message]);

  logger.verbose(' Staged files have been committed:');

  const branchWithCommitHash = stdout.split('\n')[0];
  logger.verbose(`  ${branchWithCommitHash}`);

  const hash = stdout.match(hashRegex)[0];

  const name = `v${version}`;

  await exec('git', ['tag', '-a', name, '-m', message]);

  return { name, hash };
}

module.exports = tag;