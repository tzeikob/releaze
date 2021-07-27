'use strict';

const exec = require('../util/exec');
const logger = require('../util/logger');
const { isGiven, isNotGitRef } = require('../util/validators');

async function log (range, format) {
  if (isGiven(range)) {
    if (isGiven(range.from) && isNotGitRef(range.from)) {
      throw new Error(`Invalid from range argument: ${range.from}`);
    }
  
    if (isGiven(range.to) && isNotGitRef(range.to)) {
      throw new Error(`Invalid to range argument: ${range.to}`);
    }
  }

  // Default range to empty object
  range = range ?? {};

  // Default format to '%h %s'
  format = format ?? '%h %s';

  let args = ['log', '--no-merges', '--oneline', `--format=${format}`];

  const { from, to } = range;

  // Set commit range regarding the from and to args
  if (from && to) {
    args.push(`${from}..${to}`);
  } else if (from) {
    args.push(`${from}..HEAD`);
  } else if (to) {
    args.push(to);
  }

  if (global.verbose) {
    logger.info(`Collecting git logs from ${from} to ${to}...`, 2);
  }

  const stdout = await exec('git', args);

  // Convert to string and split by new lines
  let subjects = stdout.toString().split('\n');

  // Filter out any empty elements
  subjects = subjects.filter(s => s !== '');

  if (global.verbose) {
    if (subjects.length > 0) {
      logger.info(`Found ${subjects.length} total git logs:`, 2);
      logger.info(subjects[0], 4);
    } else {
      logger.info(`No git logs have been found.`, 2);
    }
  }

  return subjects;
}

module.exports = log;