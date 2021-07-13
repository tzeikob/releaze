const semver = require('semver');
const exec = require('./util/exec');
const { isGiven, isNotBoolean, isEmptyString, isNullish } = require('./util/validators');

async function range (prerelease) {
  if (isGiven(prerelease) && isNotBoolean(prerelease)) {
    throw new Error(`Invalid non boolean prerelease argument: ${prerelease}`);
  }

  const stdout = await exec('git', ['tag']);

  if (isEmptyString(stdout) || isNullish(stdout)) {
    return { from: '', to: 'HEAD' };
  }

  const tags = stdout.trim().split('\n');
  const sorted = tags.filter(semver.valid).sort(semver.rcompare);

  let last = sorted[0];

  if (!prerelease && semver.prerelease(last)) {
    last = sorted.find((tag) => !semver.prerelease(tag));
  }

  return { from: last ?? '', to: 'HEAD' };
}

module.exports = range;