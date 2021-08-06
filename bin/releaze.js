#!/usr/bin/env node

'use strict';

const cli = require('../lib/cli');
const pkg = require('../package.json');

function handleFatalError (error) {
  const exitCode = 2;

  console.error(`Oops, something went wrong!`);
  console.error(`Error: ${error.message}`);

  console.error(`\nRun ${pkg.name} --help to get more info`);
  console.error(`Exit with code ${exitCode}`);
  process.exit(exitCode);
}

(async function main () {
  process.on('uncaughtException', handleFatalError);
  process.on('unhandledRejection', handleFatalError);

  await cli.run(process.argv);
}()).catch(handleFatalError);