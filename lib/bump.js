const { isNotSemverReleaseType } = require('./util/validators');

async function bump (type) {
  if (isNotSemverReleaseType(type)) {
    throw new Error('Invalid or missing semver release type argument');
  }
}

module.exports = bump;