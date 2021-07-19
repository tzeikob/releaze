const optionator = require('optionator');
const pkg = require('../package.json');
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
    heading: 'Bump configuration'
  }, {
    option: 'bump',
    alias: 'b',
    type: 'String',
    enum: ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'],
    required: true,
    description: 'The semver release type requested for this release'
  }, {
    option: 'preid',
    type: 'String',
    dependsOn: 'bump',
    description: 'The key id corresponding to a requested pre-release'
  }, {
    heading: 'Changelog configuration'
  }, {
    option: 'changelog',
    type: 'Boolean',
    default: 'true',
    dependsOn: 'bump',
    description: 'Use this option to create/update the CHANGELOG.md file'
  }, {
    option: 'format',
    alias: 'f',
    type: 'String',
    default: '%h %s',
    dependsOn: 'changelog',
    description: 'The template format each log should be interpolated with in the CHANGELOG.md file'
  }, {
    heading: 'Git configuration'
  }, {
    option: 'git',
    type: 'Boolean',
    default: 'true',
    dependsOn: 'bump',
    description: 'Use this option to commit the changes and create a tag in the git repository'
  }, {
    option: 'message',
    alias: 'm',
    type: 'String',
    default: 'Bump to v%s',
    dependsOn: 'git',
    description: 'The template message applied at git commit and tag operations'
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

async function run (args) {
  const opts = parse(args);

  await check();

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