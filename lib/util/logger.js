'use strict';

const chalk = require('chalk');
const { isGiven, isNotPositiveNumber } = require('./validators');

function spaces (size) {
  let indent = '';

  for (let i = 0; i < size; i++) {
    indent += ' ';
  }

  return indent;
}

function info (message, indentation) {
  if (isGiven(indentation) && isNotPositiveNumber(indentation)) {
    throw new Error(`Indentation should be a positive number: ${indentation}`);
  }

  indentation = indentation ?? 0;

  const indent = spaces(indentation);

  console.log(`${indent}${message}`);
}

function success (message, indentation) {
  if (isGiven(indentation) && isNotPositiveNumber(indentation)) {
    throw new Error(`Indentation should be a positive number: ${indentation}`);
  }

  indentation = indentation ?? 0;

  const indent = spaces(indentation);

  console.log(`${indent}${chalk.green('\u2713')} ${message}`);
}

function error (message) {
  console.error(message);
}

module.exports = { info, success, error };