const util = require('util');
const cp = require('child_process');
const { isGiven, isNotString } = require('./util/validators');

const execFile = util.promisify(cp.execFile);

async function gitlog ({ from, to, format } = {}) {
  if (isGiven(from) && isNotString(from)) {
    throw new Error(`Invalid from range argument`);
  }

  if (isGiven(to) && isNotString(to)) {
    throw new Error(`Invalid to range argument`);
  }

  if (isGiven(format) && isNotString(format)) {
    throw new Error(`Invalid format argument`);
  }

  // Default format to '%h %s'
  format = format || '%h %s';

  let args = ['log', '--oneline', `--format=${format}`];

  // Set commit range regarding the from and to args
  if (from && to) {
    args.push(`${from}^...${to}`);
  } else if (from) {
    args.push(`${from}^...`);
  } else if (to) {
    args.push(to);
  }

  let { stdout, stderr } = await execFile('git', args);

  if (stderr) {
    throw new Error(stderr);
  }

  // Convert to string and split based on end of line
  let subjects = stdout.toString().split('\n');

  // Pop the last empty string element
  subjects.pop();

  return subjects;
}

module.exports = gitlog;