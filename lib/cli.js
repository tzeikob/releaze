'use strict';

const optionator = require('optionator');
const { changelog } = require('./index');
const pkg = require('../package.json');

const { parse, generateHelp } = optionator({
  prepend: `${pkg.name} [options]`,
  append: `${pkg.name} v${pkg.version}`,
  options: [{
    heading: 'Changelog configuration'
  }, {
    option: 'changelog',
    type: 'Boolean',
    description: 'Dry print git logs with the given commit range'
  }, {
    option: 'from',
    alias: 'f',
    type: 'String',
    description: 'A git commit hash or a tag as the starting point of the git logs range',
    dependsOn: 'changelog'
  }, {
    option: 'to',
    alias: 't',
    type: 'String',
    description: 'A git commit hash or a tag as the ending point of the git logs range',
    dependsOn: 'changelog'
  }, {
    option: 'format',
    alias: 'm',
    type: 'String',
    default: '%h %s',
    description: 'The template each git log line should be formatted with (see `git log --format` docs)',
    dependsOn: 'changelog'
  }, {
    heading: 'Miscellaneous'
  }, {
    option: 'help',
    alias: 'h',
    type: 'Boolean',
    description: 'Show help'
  }, {
    option: 'version',
    alias: 'v',
    type: 'Boolean',
    description: 'Output the version number'
  }]
});

async function execute (args) {
  const opts = parse(args);

  if (opts.help) {
    const help = generateHelp();

    return console.log(help);
  }

  if (opts.version) {
    const version = `${pkg.name} v${pkg.version}`;

    return console.log(version);
  }

  if (opts.changelog) {
    const lines = await changelog(opts);

    lines.forEach((line) => console.log(line));
    console.log(`\nWow, that was a DRY output of ${lines.length} commits!`);
  } else {
    throw new Error(`Only changelog operation is supported yet: ${args}`);
  }
}

module.exports = { execute };