'use strict';

const {
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
  isNotObject,
  isNotPositiveNumber
} = require('../../lib/util/validators');

describe('Call of isGiven with', () => {
  test.each([
    1, 'hello', '', 0, -0, 0n, NaN, false, [], {}
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isGiven(value)).toBe(true);
  });

  test('null or undefined should return false', () => {
    expect.assertions(2);

    expect(isGiven(null)).toBe(false);
    expect(isGiven()).toBe(false);
  });
});

describe('Call of isNotGiven with', () => {
  test.each([
    1, 'hello', '', 0, -0, 0n, NaN, false, [], {}
  ])('%p should return false', (value) => {
    expect.assertions(1);

    expect(isNotGiven(value)).toBe(false);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotGiven(null)).toBe(true);
    expect(isNotGiven()).toBe(true);
  });
});

describe('Call of isNotString with', () => {
  test.each([
    '', 1, NaN, true, false, [], {}, Symbol('s')
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotString(value)).toBe(true);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotString(null)).toBe(true);
    expect(isNotString()).toBe(true);
  });

  test('any non-empty string should return false', () => {
    expect.assertions(1);

    expect(isNotString('hello')).toBe(false);
  });
});

describe('Call of isNotGitRef with', () => {
  test.each([
    1, '', NaN, true, false, [], {}, Symbol('s')
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotGitRef(value)).toBe(true);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotGitRef(null)).toBe(true);
    expect(isNotGitRef()).toBe(true);
  });

  test('an invalid git commit hash should return true', () => {
    expect.assertions(2);

    expect(isNotGitRef('12s4')).toBe(true);
    expect(isNotGitRef('4ec99f747f787984e7f7e94d56ef6309747b215f5')).toBe(true);
  });

  test('an invalid semver tag name should return true', () => {
    expect.assertions(5);

    expect(isNotGitRef('v01.02.03')).toBe(true);
    expect(isNotGitRef('01.02.03')).toBe(true);
    expect(isNotGitRef('.1.3')).toBe(true);
    expect(isNotGitRef('123')).toBe(true);
    expect(isNotGitRef('head')).toBe(true);
  });

  test('a valid git commit hash should return false', () => {
    expect.assertions(3);

    expect(isNotGitRef('4ec99f747f787984e7f7e94d56ef6309747b215f')).toBe(false);
    expect(isNotGitRef('4ec99f7')).toBe(false);
    expect(isNotGitRef('4ec99')).toBe(false);
  });

  test('a valid semver tag name should return false', () => {
    expect.assertions(4);

    expect(isNotGitRef('v1.2.3')).toBe(false);
    expect(isNotGitRef('v1.2.3-next.2.beta.0+build.exp')).toBe(false);

    expect(isNotGitRef('1.2.3')).toBe(false);
    expect(isNotGitRef('1.2.3-next.2.beta.0+build.exp')).toBe(false);
  });

  test('the valid HEAD ref should return false', () => {
    expect.assertions(1);

    expect(isNotGitRef('HEAD')).toBe(false);
  });
});

describe('Call of isNotSemverReleaseType with', () => {
  test.each([
    'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'
  ])('%p should return false', (value) => {
    expect.assertions(1);

    expect(isNotSemverReleaseType(value)).toBe(false);
  });

  test.each([
    1, '', NaN, true, false, [], {}, Symbol('s')
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotSemverReleaseType(value)).toBe(true);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotSemverReleaseType(null)).toBe(true);
    expect(isNotSemverReleaseType()).toBe(true);
  });

  test('any invalid semver release type should return true', () => {
    expect.assertions(11);

    expect(isNotSemverReleaseType('next')).toBe(true);
    expect(isNotSemverReleaseType('new')).toBe(true);
    expect(isNotSemverReleaseType('major major')).toBe(true);

    expect(isNotSemverReleaseType('MAJOR')).toBe(true);
    expect(isNotSemverReleaseType('PREMAJOR')).toBe(true);

    expect(isNotSemverReleaseType('MINOR')).toBe(true);
    expect(isNotSemverReleaseType('PREMINOR')).toBe(true);

    expect(isNotSemverReleaseType('PATCH')).toBe(true);
    expect(isNotSemverReleaseType('PREPATCH')).toBe(true);

    expect(isNotSemverReleaseType('PRERELEASE')).toBe(true);
    expect(isNotSemverReleaseType('prerelease prerelease')).toBe(true);
  });
});

describe('Call of isNotSemver with', () => {
  test.each([
    1, '', NaN, true, false, [], {}, Symbol('s')
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotSemver(value)).toBe(true);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotSemver(null)).toBe(true);
    expect(isNotSemver()).toBe(true);
  });

  test('an invalid semver number should return true', () => {
    expect.assertions(6);

    expect(isNotSemver('v01.02.03')).toBe(true);
    expect(isNotSemver('01.02.03')).toBe(true);
    expect(isNotSemver('.1.3')).toBe(true);
    expect(isNotSemver('1.3')).toBe(true);
    expect(isNotSemver('3')).toBe(true);
    expect(isNotSemver('123')).toBe(true);
  });

  test('a valid semver number should return false', () => {
    expect.assertions(4);

    expect(isNotSemver('v1.2.3')).toBe(false);
    expect(isNotSemver('v1.2.3-next.2.beta.0+build.exp')).toBe(false);

    expect(isNotSemver('1.2.3')).toBe(false);
    expect(isNotSemver('1.2.3-next.2.beta.0+build.exp')).toBe(false);
  });
});

describe('Call of isNotArray with', () => {
  test.each([
    1, '', NaN, true, false, {}, Symbol('s')
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotArray(value)).toBe(true);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotArray(null)).toBe(true);
    expect(isNotArray()).toBe(true);
  });

  test('any valid array should return false', () => {
    expect.assertions(2);

    expect(isNotArray([])).toBe(false);
    expect(isNotArray(['a', 'b', 'c'])).toBe(false);
  });
});

describe('Call of isNotBoolean with', () => {
  test.each([
    1, '', NaN, [], {}, Symbol('s'), 'true', 'false'
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotBoolean(value)).toBe(true);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotBoolean(null)).toBe(true);
    expect(isNotBoolean()).toBe(true);
  });

  test('true or false should return false', () => {
    expect.assertions(2);

    expect(isNotBoolean(true)).toBe(false);
    expect(isNotBoolean(false)).toBe(false);
  });
});

describe('Call of isNullish with', () => {
  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNullish(null)).toBe(true);
    expect(isNullish()).toBe(true);
  });

  test.each([
    1, '', NaN, true, false, 0, -0, 0n, [], {}, Symbol('s'), 'null', 'undefined'
  ])('%p should return false', (value) => {
    expect.assertions(1);

    expect(isNullish(value)).toBe(false);
  });
});

describe('Call of isEmptyString with', () => {
  test('empty string should return true', () => {
    expect.assertions(1);

    expect(isEmptyString('')).toBe(true);
  });

  test.each([
    1, 'hello', NaN, true, false, [], {}, Symbol('s')
  ])('%p should return false', (value) => {
    expect.assertions(1);

    expect(isEmptyString(value)).toBe(false);
  });
});

describe('Call of isNotObject with', () => {
  test.each([
    1, 'hello', '', NaN, [], Symbol('s')
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotObject(value)).toBe(true);
  });

  test('null or undefined should return true', () => {
    expect.assertions(2);

    expect(isNotObject(null)).toBe(true);
    expect(isNotObject()).toBe(true);
  });

  test('any valid object should return false', () => {
    expect.assertions(4);

    expect(isNotObject({})).toBe(false);
    expect(isNotObject({ a: 1 })).toBe(false);
    expect(isNotObject(new Error())).toBe(false);
    expect(isNotObject(Object.create(null))).toBe(false);
  });
});

describe('Call of isNotPositiveNumber with', () => {
  test.each([
    -1, '-1', '', 0, -0, 0n, NaN, -Infinity, Infinity, [], {}, Symbol('s')
  ])('%p should return true', (value) => {
    expect.assertions(1);

    expect(isNotPositiveNumber(value)).toBe(true);
  });

  test('null ord undefined should return true', () => {
    expect.assertions(2);

    expect(isNotPositiveNumber(null)).toBe(true);
    expect(isNotPositiveNumber()).toBe(true);
  });

  test('any valid positive number should return false', () => {
    expect.assertions(2);

    expect(isNotPositiveNumber(1)).toBe(false);
    expect(isNotPositiveNumber(1.5)).toBe(false);
  });
});