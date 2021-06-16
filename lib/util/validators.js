const semver = require('semver');

function isGiven (value) {
  const type = typeof value;

  if (type === 'undefined' || value === null) {
    return false;
  }

  return true;
}

function isNotString (value) {
  const type = typeof value;

  if (type === 'string' && value !== '') {
    return false;
  }

  return true;
}

const hash = /^[0-9a-f]{5,40}$/i;

function isNotHashOrTag (value) {
  if (isNotString(value)) {
    return true;
  }

  if (hash.test(value) || semver.valid(value)) {
    return false;
  }

  return true;
}

const majorOrMinorOrPatch = /\b(major|minor|patch)\b/i;

function isNotSemverReleaseType (value) {
  if (isNotString(value)) {
    return true;
  }

  if (majorOrMinorOrPatch.test(value)) {
    return false;
  }

  return true;
}

module.exports = {
  isGiven,
  isNotString,
  isNotHashOrTag,
  isNotSemverReleaseType
};