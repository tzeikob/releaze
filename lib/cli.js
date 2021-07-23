'use strict';

const optionator = require('optionator');
const pkg = require('../package.json');
const exec = require('./util/exec');
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
    heading: 'Bump version using semver notation'
  }, {
    option: 'bump',
    alias: 'b',
    type: 'String',
    enum: ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'],
    required: true,
    description: 'A valid semver release type'
  }, {
    option: 'preid',
    type: 'String',
    dependsOn: 'bump',
    description: 'The key id for the requested pre-release'
  }, {
    heading: 'Create or update the changelog file'
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
    description: 'Use this option along with `--changelog` to format each git log with in the changelog file'
  }, {
    heading: 'Commit and tag the bump changes to git repository'
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
    heading: 'Execute testing before the release operations'
  }, {
    option: 'test',
    type: 'Boolean',
    dependsOn: 'bump',
    description: 'Use this option to run testing before the release'
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

  await check();

  if (opts.test) {
    await exec('npm', ['test']);
  }

  const { bump: type, preid } = opts;

  let release;

  if (preid) {
    release = await bump(type, preid);
  } else {
    release = await bump(type);
  }

  const { next, isPrerelease } = release;

  if (opts.changelog) {
    const { from, to } = await range(isPrerelease);
    const logs = await log({ from, to }, opts.format);

    await changelog(next, logs);
  }

  if (opts.git) {
    await tag(next, opts.message);
  }
}

module.exports = { run };