'use strict';

const semver = require('semver');
const exec = require('../util/exec');
const logger = require('../util/logger');
const { isGiven, isNotBoolean, isEmptyString, isNullish } = require('../util/validators');

async function range (isPrerelease) {
  if (isGiven(isPrerelease) && isNotBoolean(isPrerelease)) {
    throw new Error(`Invalid non boolean isPrerelease argument: ${isPrerelease}`);
  }

  if (global.verbose) {
    logger.info('Resolving the last git tag...', 2);
  }

  const stdout = await exec('git', ['tag']);

  if (isEmptyString(stdout) || isNullish(stdout)) {
    logger.info(`No tags have been found.`, 2);
    logger.info(`Git logs bounded to the range { from: null, to: 'HEAD' }`, 2);

    return { from: null, to: 'HEAD' };
  }

  const tags = stdout.trim().split('\n');
  const sorted = tags.filter(semver.valid).sort(semver.rcompare);

  let last = sorted[0];

  if (!isPrerelease && semver.prerelease(last)) {
    last = sorted.find((tag) => !semver.prerelease(tag));
  }

  last = last ?? null;

  if (global.verbose) {
    if (last) {
      logger.info(`The last tag has been found and pointing to ${last}.`, 2);
      logger.info(`Git logs bounded to the range { from: '${last}', to: 'HEAD' }`, 2);
    } else {
      logger.info(`No last tag has been found.`, 2);
      logger.info(`Git logs bounded to the range { from: null, to: 'HEAD' }`, 2);
    }
  }

  return { from: last, to: 'HEAD' };
}

module.exports = range;