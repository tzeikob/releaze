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

  if (global.verbose) {
    logger.info('File package.json has been staged.', 2);
  }

  try {
    await exec('git', ['add', 'CHANGELOG.md']);

    if (global.verbose) {
      logger.info('File CHANGELOG.md has been staged.', 2);
    }
  } catch (error) {}

  try {
    await exec('git', ['add', 'package-lock.json']);

    if (global.verbose) {
      logger.info('File package-lock.json has been staged.', 2);
    }
  } catch (error) {}

  try {
    await exec('git', ['add', 'npm-shrinkwrap.json']);

    if (global.verbose) {
      logger.info('File npm-shrinkwrap.json has been staged.', 2);
    }
  } catch (error) {}

  version = semver.clean(version);
  message = message ?? 'Bump to v%s';
  message = message.replace(/%s/g, version);

  const stdout = await exec('git', ['commit', '-m', message]);

  if (global.verbose) {
    logger.info('All files have been committed:', 2);
    logger.info(stdout.split('\n')[0], 4);
  }

  const hash = stdout.match(hashRegex)[0];

  const name = `v${version}`;

  await exec('git', ['tag', '-a', name, '-m', message]);

  return { name, hash };
}

module.exports = tag;