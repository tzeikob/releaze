const semver = require('semver');

function isGiven (value) {
  const type = typeof value;

  if (type === 'undefined' || value === null) {
    return false;
  }

  return true;
}

function isNotGiven(value) {
  return !isGiven(value);
}

function isNotString (value) {
  const type = typeof value;

  if (type === 'string' && value !== '') {
    return false;
  }

  return true;
}

const hashRegex = /^[0-9a-f]{5,40}$/i;

function isNotGitRef (value) {
  if (isNotString(value)) {
    return true;
  }

  if (hashRegex.test(value) || value === 'HEAD' || semver.valid(value)) {
    return false;
  }

  return true;
}

const releaseTypeRegex = /^((pre)?major|(pre)?minor|(pre)?patch|prerelease)$/;

function isNotSemverReleaseType (value) {
  if (isNotString(value)) {
    return true;
  }

  if (releaseTypeRegex.test(value)) {
    return false;
  }

  return true;
}

function isNotSemver(value) {
  return !semver.valid(value);
}

function isNotArray (value) {
  return !Array.isArray(value);
}

function isNotBoolean (value) {
  return typeof value !== 'boolean';
}

function isNullish (value) {
  return typeof value === 'undefined' || value === null;
}

function isEmptyString (value) {
  return value === '';
}

function isNotObject (value) {
  return typeof value !== 'object' || value === null || Array.isArray(value);
}

module.exports = {
  isGiven,
  isNotGiven,
  isNotString,
  isNotGitRef,
  isNotSemverReleaseType,
  isNotSemver,
  isNotArray,
  isNotBoolean,
  isNullish,
  isEmptyString,
  isNotObject
};