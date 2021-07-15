const { execFile } = require('child_process');
const { isGiven, isNotGiven, isNotArray } = require('../util/validators');

function exec (file, args) {
  return new Promise((resolve, reject) => {
    if (isNotGiven(file)) {
      return reject(new Error(`Missing file argument: ${file}`));
    }

    if (isGiven(args) && isNotArray(args)) {
      return reject(new Error(`Invalid non array args argument: ${args}`));
    }

    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(error.message));
      }

      if (stderr) {
        return reject(new Error(stderr));
      }

      resolve(stdout);
    });
  });
}

module.exports = exec;