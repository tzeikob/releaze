'use strict';

const { execFile } = require('child_process');
const { isGiven, isNotGiven, isNotArray } = require('./validators');

function exec (file, args) {
  return new Promise((resolve, reject) => {
    if (isNotGiven(file)) {
      reject(new Error(`Missing file argument: ${file}`));

      return;
    }

    if (isGiven(args) && isNotArray(args)) {
      reject(new Error(`Invalid non array args argument: ${args}`));

      return;
    }

    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message));

        return;
      }

      if (stderr) {
        reject(new Error(stderr));

        return;
      }

      resolve(stdout);
    });
  });
}

module.exports = exec;