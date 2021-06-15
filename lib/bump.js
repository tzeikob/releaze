const { isNotSemverRelease } = require('./util/validators');

async function bump (release) {
  if (isNotSemverRelease(release)) {
    throw new Error('Invalid or missing release argument');
  }
}

module.exports = bump;