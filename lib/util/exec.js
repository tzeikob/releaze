const { execFile } = require('child_process');
const ExecError = require('../errors/exec-error');
const { isGiven, isNotString, isNotArray } = require('../util/validators');

function exec (file, args) {
  return new Promise((resolve, reject) => {
    if (isNotString(file)) {
      return reject(new ExecError(`Invalid or missing file argument: ${String(file)}`));
    }

    if (isGiven(args) && isNotArray(args)) {
      return reject(new ExecError(`Invalid non array args argument: ${String(args)}`));
    }

    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        return reject(new ExecError(error.message));
      }

      if (stderr) {
        return reject(new ExecError(stderr));
      }

      resolve(stdout);
    });
  });
}

module.exports = exec;