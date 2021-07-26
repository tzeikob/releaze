"use strict";

const chalk = require('chalk');

function info (...args) {
  console.log(...args);
}

function success (...args) {
  console.log(`${chalk.green('\u2713')} ${args[0]}`, ...args.slice(1));
}

function error (...args) {
  console.error(...args);
}

module.exports = { info, success, error };