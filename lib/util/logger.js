'use strict';

const chalk = require('chalk');

class Logger {
  constructor (level) {
    this.level = level;
  }

  debug (message) {
    if (this.level.match(/DEBUG/)) {
      console.log(message);
    }
  }

  verbose (message) {
    if (this.level.match(/DEBUG|VERBOSE/)) {
      console.log(message);
    }
  }

  info (message) {
    if (this.level.match(/DEBUG|VERBOSE|INFO/)) {
      console.log(message);
    }
  }

  success (message) {
    if (this.level.match(/DEBUG|VERBOSE|INFO|SUCCESS/)) {
      console.log(`${chalk.green('\u2713')} ${message}`);
    }
  }

  error (message) {
    if (this.level.match(/DEBUG|VERBOSE|INFO|SUCCESS|ERROR/)) {
      console.error(message);
    }
  }
}

const logger = new Logger('INFO');

module.exports = logger;