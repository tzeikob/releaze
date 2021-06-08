'use strict';

const cli = require('cli');
const { changelog } = require('./index');

const usage = `releaze [--help]
    <command> [<options>]

  Start dry printing commits within a range:
  changelog                Print all commits
  changelog --to           Print the commits starting from the first commit up to the given hash or tag, [, to]
  changelog --from         Print the commits starting from the given hash or tag up to the last commit, [from, ]
  changelog --from --to    Print the commits fall within the given range [from, to]`;

const options = {
  from: ['f', 'Commit hash or tag to include commits from', 'string'],
  to: ['t', 'Commit hash or tag to include commits up to', 'string'],
  format: ['m', 'The format of the log message (see `git log` format placeholders)', 'string','%h %s']
};

cli.setUsage(usage).parse(options);

cli.main((args, opts) => {
  if (args.includes('changelog') && args.length === 1) {
    changelog(opts)
      .then((lines) => {
        lines.forEach((line) => console.log(line));

        console.log(`\nWow, that was a DRY output of ${lines.length} commits!`);
      })
      .catch((error) => console.error(error));
  } else {
    console.log(`Oops, operation not supported: ${args}\nRun releaze --help to get more info`);
  }
});