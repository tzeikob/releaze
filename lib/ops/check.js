'use strict';

const fs = require('fs');
const exec = require('../util/exec');
const { isNotGiven, isNotSemver, isNotObject } = require('../util/validators');

const { readFile, access } = fs.promises;

async function check () {
  const data = await readFile('package.json', 'utf8');

  const pkg = JSON.parse(data);

  if (isNotObject(pkg)) {
    throw new SyntaxError('JSON is not a valid object in package.json');
  }

  if (isNotGiven(pkg.version) || isNotSemver(pkg.version)) {
    throw new Error('Invalid or missing semver version in package.json');
  }

  await access('.git/index');
  await exec('git', ['log']);

  const stdout = await exec('git', ['status', '--porcelain']);

  if (stdout) {
    throw new Error('Working directory is not clean, please stage and commit before use');
  }

  return pkg;
};

module.exports = check;