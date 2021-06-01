'use strict';

const cli = require('cli');
const { changelog } = require('./index');

const usage = `verzion changelog [options]
  verzion changelog - Prints in std output all the commits along with their hash`;

const options = {
  from: ['f', 'Hash of the commit to start from', 'string'],
  to: ['t', 'Hash of the commit to stop to', 'string']
};

cli.setUsage(usage).parse(options);

cli.main((args, opts) => {
  if (args.includes('changelog') && args.length === 1) {
    changelog(opts.from, opts.to)
      .then((lines) => {
        lines.forEach((line) => console.log(line));

        console.log(`\nWow, that was a DRY output of ${lines.length} commits!`);
      })
      .catch((error) => console.error(error));
  } else {
    console.log(`Oops, operation not supported: ${args}\nRun verzion --help to get more info`);
  }
});