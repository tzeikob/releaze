const util = require('util');
const cp = require('child_process');
const LogError = require('./errors/log-error');
const { isGiven, isNotString, isNotHashOrTag } = require('./util/validators');

const execFile = util.promisify(cp.execFile);

async function log ({ from, to, format } = {}) {
  if (isGiven(from) && isNotHashOrTag(from)) {
    throw new LogError('Invalid from range argument', from);
  }

  if (isGiven(to) && isNotHashOrTag(to)) {
    throw new LogError('Invalid to range argument', to);
  }

  if (isGiven(format) && isNotString(format)) {
    throw new LogError('Invalid format argument', format);
  }

  // Default format to '%h %s'
  format = format || '%h %s';

  let args = ['log', '--no-merges', '--oneline', `--format=${format}`];

  // Set commit range regarding the from and to args
  if (from && to) {
    args.push(`${from}..${to}`);
  } else if (from) {
    args.push(`${from}..`);
  } else if (to) {
    args.push(to);
  }

  let { stdout, stderr } = await execFile('git', args);

  if (stderr) {
    throw new Error(stderr);
  }

  // Convert to string and split by new lines
  let subjects = stdout.toString().split('\n');

  // Filter out any empty elements
  subjects = subjects.filter(s => s !== '');

  return subjects;
}

module.exports = log;