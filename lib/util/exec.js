const { execFile } = require('child_process');
const { isGiven, isNotString, isNotArray } = require('../util/validators');

function exec (file, args) {
  return new Promise((resolve, reject) => {
    if (isNotString(file)) {
      return reject(new Error(`Invalid or missing file argument: ${String(file)}`));
    }

    if (isGiven(args) && isNotArray(args)) {
      return reject(new Error(`Invalid non array args argument: ${String(args)}`));
    }

    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      if (stderr) {
        return reject(new Error(stderr));
      }

      resolve(stdout);
    });
  });
}

module.exports = exec;