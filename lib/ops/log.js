'use strict';

const exec = require('../util/exec');
const logger = require('../util/logger');
const { isGiven, isNotGitRange } = require('../util/validators');

async function log (range, format) {
  if (isGiven(range) && isNotGitRange(range)) {
    throw new Error(`Invalid git range argument: ${range.from}, ${range.to}`);
  }

  // Default range to empty object
  range = range ?? {};

  // Default format to '%h %s'
  format = format ?? '%h %s';

  const args = ['log', '--no-merges', '--oneline', `--format=${format}`];

  const { from, to } = range;

  // Compose the git log range notation
  if (from && to) {
    args.push(`${from}..${to}`);
  } else if (from) {
    args.push(`${from}..HEAD`);
  } else if (to) {
    args.push(to);
  }

  logger.verbose(` Collecting git logs from ${from} to ${to}`);

  const stdout = await exec('git', args);

  // Convert to string and split by new lines
  let subjects = stdout.toString().split('\n');

  // Filter out any empty elements
  subjects = subjects.filter((s) => s !== '');

  if (subjects.length > 0) {
    logger.verbose(` Found ${subjects.length} total git log(s)`);
  } else {
    logger.verbose(' No git logs have been found');
  }

  return subjects;
}

module.exports = log;