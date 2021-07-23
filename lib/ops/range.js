'use strict';

const semver = require('semver');
const exec = require('../util/exec');
const { isGiven, isNotBoolean, isEmptyString, isNullish } = require('../util/validators');

async function range (isPrerelease) {
  if (isGiven(isPrerelease) && isNotBoolean(isPrerelease)) {
    throw new Error(`Invalid non boolean isPrerelease argument: ${isPrerelease}`);
  }

  const stdout = await exec('git', ['tag']);

  if (isEmptyString(stdout) || isNullish(stdout)) {
    return { from: null, to: 'HEAD' };
  }

  const tags = stdout.trim().split('\n');
  const sorted = tags.filter(semver.valid).sort(semver.rcompare);

  let last = sorted[0];

  if (!isPrerelease && semver.prerelease(last)) {
    last = sorted.find((tag) => !semver.prerelease(tag));
  }

  return { from: last ?? null , to: 'HEAD' };
}

module.exports = range;