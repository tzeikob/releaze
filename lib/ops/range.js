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
    logger.verbose(' No tags have been found');
    logger.verbose(" Git logs will be bounded to the range { from: null, to: 'HEAD' }");

    return { from: null, to: 'HEAD' };
  }

  const tags = stdout.trim().split('\n');
  const sorted = tags.filter(semver.valid).sort(semver.rcompare);

  let last = sorted[0];

  if (!isPrerelease && semver.prerelease(last)) {
    last = sorted.find((tag) => !semver.prerelease(tag));
  }

  last = last ?? null;

  if (last) {
    logger.verbose(` The last tag found is ${last}`);
    logger.verbose(` Git logs will be bounded to the range { from: '${last}', to: 'HEAD' }`);
  } else {
    logger.verbose(' No last tag has been found');
    logger.verbose(" Git logs will be bounded to the range { from: null, to: 'HEAD' }");
  }

  return { from: last, to: 'HEAD' };
}

module.exports = range;