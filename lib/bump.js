const { readFile } = require('fs').promises;
const path = require('path');
const { isNotSemverReleaseType } = require('./util/validators');

async function bump (type) {
  if (isNotSemverReleaseType(type)) {
    throw new Error('Invalid or missing semver release type argument');
  }

  const filepath = path.join(process.cwd(), "package.json");
  const data = await readFile(filepath, 'utf-8');
}

module.exports = bump;