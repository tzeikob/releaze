'use strict';

const optionator = require('optionator');
const { green, yellow } = require('chalk');
const pkg = require('../package.json');
const logger = require('./util/logger');
const check = require('./ops/check');
const bump = require('./ops/bump');
const range = require('./ops/range');
const log = require('./ops/log');
const changelog = require('./ops/changelog');
const tag = require('./ops/tag');

const { parse, generateHelp } = optionator({
  prepend: `${pkg.name} [options]`,
  append: `${pkg.name} v${pkg.version}`,
  options: [{
    heading: 'Bump to a newer version using semver release notation'
  }, {
    option: 'bump',
    alias: 'b',
    type: 'String',
    enum: ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'],
    required: true,
    description: 'A valid semver compatible release type to bump version by'
  }, {
    option: 'preid',
    type: 'String',
    dependsOn: 'bump',
    description: 'The key id in the special case of a pre-release bump'
  }, {
    heading: 'Create or update the changelog file with the commit logs fall in the bump range'
  }, {
    option: 'changelog',
    type: 'Boolean',
    default: 'true',
    dependsOn: 'bump',
    description: 'Use this opt-out option to skip creating or updating the changelog file'
  }, {
    option: 'format',
    alias: 'f',
    type: 'String',
    default: '%h %s',
    dependsOn: 'changelog',
    description: 'Use this option along with `--changelog` to style each log by using git log format notation'
  }, {
    heading: 'Commit and tag the bump changes to the git repository'
  }, {
    option: 'git',
    type: 'Boolean',
    default: 'true',
    dependsOn: 'bump',
    description: 'Use this opt-out option to skip committing and tagging the changes to the git repository'
  }, {
    option: 'message',
    alias: 'm',
    type: 'String',
    default: 'Bump to v%s',
    dependsOn: 'git',
    description: 'Use this option along with `--git` to set the message applied at git commit and tag'
  }, {
    heading: 'Miscellaneous'
  }, {
    option: 'help',
    alias: 'h',
    type: 'Boolean',
    overrideRequired: true,
    description: 'Show help'
  }, {
    option: 'version',
    alias: 'v',
    type: 'Boolean',
    overrideRequired: true,
    description: 'Output the version number'
  }, {
    option: 'verbose',
    type: 'Boolean',
    description: 'Use this option to get verbose output'
  }]
});

async function run (args) {
  const opts = parse(args);

  if (opts.version) {
    return console.log(pkg.version);
  }

  if (opts.help) {
    const help = generateHelp();
    return console.log(help);
  }

  if (opts.verbose) {
    global.verbose = true;
  }

  logger.info('Checking npm and git pre-conditions:');

  await check();

  logger.success('All npm and git pre-conditions are met', 1);

  const { bump: type, preid } = opts;

  let release;

  if (preid) {
    logger.info(`Bumping to the next ${yellow(type)} ${yellow(preid)} version:`);

    release = await bump(type, preid);
  } else {
    logger.info(`Bumping to the next ${yellow(type)} version:`);

    release = await bump(type);
  }

  const { current, next, isPrerelease } = release;

  logger.success(`Version bumped successfully from ${yellow(current)} to ${yellow(next)}`, 1);

  if (opts.changelog) {
    logger.info(`Writing changes to changelog file:`);

    const { from, to } = await range(isPrerelease);
    const logs = await log({ from, to }, opts.format);

    await changelog(next, logs);

    logger.success(`The ${yellow('CHANGELOG.md')} file has been updated`, 1);
  }

  if (opts.git) {
    logger.info(`Creating a new git annotation tag:`);

    const { name, hash } = await tag(next, opts.message);

    logger.success(`Tag ${yellow(name)} has been created on commit with ${yellow(hash)} hash`, 1);
  }

  logger.info(`Release ${green(`v${next}`)} has been completed successfully!`);
}

module.exports = { run };