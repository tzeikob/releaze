#!/usr/bin/env node
'use strict';

const { version } = require('../package.json');

function onFatalError(error) {
  process.exitCode = 2;

  console.error(`Oops,something went wrong! \nReleaze: ${version}\n${error}`);
  console.error(error);
}

(async function main() {
  process.on('uncaughtException', onFatalError);
  process.on('unhandledRejection', onFatalError);

  process.exitCode = await require('../lib/cli.js');
}()).catch(onFatalError);