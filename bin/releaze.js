#!/usr/bin/env node

'use strict';

const cli = require('../lib/cli');
const logger = require('../lib/util/logger');
const pkg = require('../package.json');

function handleFatalError (error) {
  const exitCode = 2;

  logger.error('Oops, something went wrong!');
  logger.error(`Error: ${error.message}`);

  logger.error(`\nRun ${pkg.name} --help to get more info`);
  logger.error(`Exit with code ${exitCode}`);

  process.exit(exitCode);
}

(async function main () {
  process.on('uncaughtException', handleFatalError);
  process.on('unhandledRejection', handleFatalError);

  await cli.run(process.argv);
})().catch(handleFatalError);