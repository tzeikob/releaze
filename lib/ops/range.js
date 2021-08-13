'use strict';

const semver = require('semver');
const exec = require('../util/exec');
const logger = require('../util/logger');
const { isGiven, isNotBoolean, isEmptyString, isNullish } = require('../util/validators');

async function range (isPrerelease) {
  if (isGiven(isPrerelease) && isNotBoolean(isPrerelease)) {
    throw new Error(`Invalid non boolean isPrerelease argument: ${isPrerelease}`);
  }

  const stdout = await exec('git', ['tag']);

  if (isEmptyString(stdout) || isNullish(stdout)) {
    if (global.verbose) {
      logger.info('No tags have been found', 1);
      logger.info("Git logs will be bounded to the range { from: null, to: 'HEAD' }", 1);
    }

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
      logger.info(`The last tag found is ${last}`, 1);
      logger.info(`Git logs will be bounded to the range { from: '${last}', to: 'HEAD' }`, 1);
    } else {
      logger.info('No last tag has been found', 1);
      logger.info("Git logs will be bounded to the range { from: null, to: 'HEAD' }", 1);
    }
  }

  return { from: last, to: 'HEAD' };
}

module.exports = range;