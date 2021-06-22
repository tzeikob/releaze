const util = require('util');
const cp = require('child_process');
const semver = require('semver');
const { isGiven } = require('./util/validators');
const RangeError = require('./errors/range-error');

const execFile = util.promisify(cp.execFile);

async function range (prerelease) {
  if (isGiven(prerelease) && typeof prerelease !== 'boolean') {
    throw new RangeError('Invalid non boolean prerelease argument');
  }

  const { stdout, stderr } = await execFile('git', ['tag']);

  if (stderr) {
    throw new Error(stderr);
  }

  const tags = stdout.trim().split('\n');

  const sorted = tags.filter(semver.valid).sort(semver.rcompare);

  let last = sorted[0];

  if (!prerelease && semver.prerelease(last)) {
    last = sorted.find((tag) => !semver.prerelease(tag));
  }

  let result = {};

  if (last) {
    result = { from: last, to: 'HEAD' };
  }

  return result;
}

module.exports = range;