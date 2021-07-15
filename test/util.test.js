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
  isEmptyString
} = require('../lib/util/validators');

describe('Call of isGiven(value)', () => {
  test('should return true for any value except null and undefined', () => {
    expect.assertions(14);

    expect(isGiven('str')).toBe(true);
    expect(isGiven('')).toBe(true);

    expect(isGiven(123)).toBe(true);
    expect(isGiven(0)).toBe(true);
    expect(isGiven(-0)).toBe(true);
    expect(isGiven(0n)).toBe(true);
    expect(isGiven(NaN)).toBe(true);
    expect(isGiven(Infinity)).toBe(true);

    expect(isGiven(true)).toBe(true);
    expect(isGiven(false)).toBe(true);

    expect(isGiven([])).toBe(true);
    expect(isGiven({})).toBe(true);
    expect(isGiven(Symbol('s'))).toBe(true);

    expect(isGiven(() => {})).toBe(true);
  });

  test('should return false for value equal to null or undefined', () => {
    expect.assertions(3);

    expect(isGiven(null)).toBe(false);
    expect(isGiven(undefined)).toBe(false);
    expect(isGiven()).toBe(false);
  });
});

describe('Call of isNotGiven(value)', () => {
  test('should return false for any value except null and undefined', () => {
    expect.assertions(14);

    expect(isNotGiven('str')).toBe(false);
    expect(isNotGiven('')).toBe(false);

    expect(isNotGiven(123)).toBe(false);
    expect(isNotGiven(0)).toBe(false);
    expect(isNotGiven(-0)).toBe(false);
    expect(isNotGiven(0n)).toBe(false);
    expect(isNotGiven(NaN)).toBe(false);
    expect(isNotGiven(Infinity)).toBe(false);

    expect(isNotGiven(true)).toBe(false);
    expect(isNotGiven(false)).toBe(false);

    expect(isNotGiven([])).toBe(false);
    expect(isNotGiven({})).toBe(false);
    expect(isNotGiven(Symbol('s'))).toBe(false);

    expect(isNotGiven(() => {})).toBe(false);
  });

  test('should return true for value equal to null or undefined', () => {
    expect.assertions(3);

    expect(isNotGiven(null)).toBe(true);
    expect(isNotGiven(undefined)).toBe(true);
    expect(isNotGiven()).toBe(true);
  });
});

describe('Call of isNotString(value)', () => {
  test('should return true for any value except a non string', () => {
    expect.assertions(12);

    expect(isNotString(123)).toBe(true);
    expect(isNotString(NaN)).toBe(true);
    expect(isNotString(Infinity)).toBe(true);

    expect(isNotString(true)).toBe(true);
    expect(isNotString(false)).toBe(true);

    expect(isNotString([])).toBe(true);
    expect(isNotString({})).toBe(true);
    expect(isNotString(Symbol('s'))).toBe(true);

    expect(isNotString(() => {})).toBe(true);

    expect(isNotString(null)).toBe(true);
    expect(isNotString(undefined)).toBe(true);
    expect(isNotString()).toBe(true);
  });

  test('should return true for empty string value', () => {
    expect.assertions(1);

    expect(isNotString('')).toBe(true);
  });

  test('should return false for value equal to only a non empty string', () => {
    expect.assertions(1);

    expect(isNotString('str')).toBe(false);
  });
});

describe('Call of isNotGitRef(value)', () => {
  test('should return true for any value except a non empty string', () => {
    expect.assertions(13);

    expect(isNotGitRef(123)).toBe(true);
    expect(isNotGitRef(NaN)).toBe(true);
    expect(isNotGitRef(Infinity)).toBe(true);

    expect(isNotGitRef(true)).toBe(true);
    expect(isNotGitRef(false)).toBe(true);

    expect(isNotGitRef([])).toBe(true);
    expect(isNotGitRef({})).toBe(true);
    expect(isNotGitRef(Symbol('s'))).toBe(true);

    expect(isNotGitRef(() => {})).toBe(true);

    expect(isNotGitRef(null)).toBe(true);
    expect(isNotGitRef(undefined)).toBe(true);
    expect(isNotGitRef()).toBe(true);

    expect(isNotGitRef('')).toBe(true);
  });

  test('should return true for a not valid git commit hash (sha1)', () => {
    expect.assertions(20);

    expect(isNotGitRef('12s4')).toBe(true);
    expect(isNotGitRef('1.2s.4')).toBe(true);
    expect(isNotGitRef('a')).toBe(true);
    expect(isNotGitRef('4ec99f747f787984e7f7e94d56ef6309747b215f5')).toBe(true);

    expect(isNotGitRef('c71f64b^')).toBe(true);
    expect(isNotGitRef('c71f64b^^')).toBe(true);
    expect(isNotGitRef('c71f64b^2')).toBe(true);
    expect(isNotGitRef('^c71f64b')).toBe(true);
    expect(isNotGitRef('c71f64b~')).toBe(true);
    expect(isNotGitRef('c71f64b~~')).toBe(true);
    expect(isNotGitRef('c71f64b~2')).toBe(true);
    expect(isNotGitRef('~c71f64b')).toBe(true);

    expect(isNotGitRef('..')).toBe(true);
    expect(isNotGitRef('c71f64b..')).toBe(true);
    expect(isNotGitRef('c71f64b..c71f64b')).toBe(true);
    expect(isNotGitRef('..c71f64b')).toBe(true);

    expect(isNotGitRef('...')).toBe(true);
    expect(isNotGitRef('c71f64b...')).toBe(true);
    expect(isNotGitRef('c71f64b...c71f64b')).toBe(true);
    expect(isNotGitRef('...c71f64b')).toBe(true);
  });

  test('should return true for a not valid semver tag name', () => {
    expect.assertions(6);

    expect(isNotGitRef('v01.02.03')).toBe(true);
    expect(isNotGitRef('01.02.03')).toBe(true);
    expect(isNotGitRef('.1.3')).toBe(true);
    expect(isNotGitRef('3')).toBe(true);
    expect(isNotGitRef('123')).toBe(true);
    expect(isNotGitRef('head')).toBe(true);
  });

  test('should return false for a valid git commit hash (sha1)', () => {
    expect.assertions(3);

    expect(isNotGitRef('4ec99f747f787984e7f7e94d56ef6309747b215f')).toBe(false);
    expect(isNotGitRef('4ec99f7')).toBe(false);
    expect(isNotGitRef('4ec99')).toBe(false);
  });

  test('should return false for a valid semver tag name', () => {
    expect.assertions(6);

    expect(isNotGitRef('v9.9.9')).toBe(false);
    expect(isNotGitRef('v1.2.3')).toBe(false);
    expect(isNotGitRef('v1.2.3-next.2.beta.0+build.exp')).toBe(false);

    expect(isNotGitRef('9.9.9')).toBe(false);
    expect(isNotGitRef('1.2.3')).toBe(false);
    expect(isNotGitRef('1.2.3-next.2.beta.0+build.exp')).toBe(false);
  });

  test('should return false for the `HEAD` alias tag', () => {
    expect.assertions(1);

    expect(isNotGitRef('HEAD')).toBe(false);
  });
});

describe('Call of isNotSemverReleaseType(value)', () => {
  test('should return false for the string values `(pre)major`, `(pre)minor`, `(pre)patch` and `prerelease`', () => {
    expect.assertions(7);

    expect(isNotSemverReleaseType('major')).toBe(false);
    expect(isNotSemverReleaseType('premajor')).toBe(false);

    expect(isNotSemverReleaseType('minor')).toBe(false);
    expect(isNotSemverReleaseType('preminor')).toBe(false);

    expect(isNotSemverReleaseType('patch')).toBe(false);
    expect(isNotSemverReleaseType('prepatch')).toBe(false);

    expect(isNotSemverReleaseType('prerelease')).toBe(false);
  });

  test('should return true for any value except `(pre)major`, `(pre)minor`, `(pre)patch` and prerelease', () => {
    expect.assertions(30);

    expect(isNotSemverReleaseType()).toBe(true);
    expect(isNotSemverReleaseType(null)).toBe(true);
    expect(isNotSemverReleaseType(undefined)).toBe(true);

    expect(isNotSemverReleaseType(123)).toBe(true);
    expect(isNotSemverReleaseType(NaN)).toBe(true);
    expect(isNotSemverReleaseType(Infinity)).toBe(true);

    expect(isNotSemverReleaseType(true)).toBe(true);
    expect(isNotSemverReleaseType(false)).toBe(true);

    expect(isNotSemverReleaseType([])).toBe(true);
    expect(isNotSemverReleaseType({})).toBe(true);
    expect(isNotSemverReleaseType(Symbol('s'))).toBe(true);

    expect(isNotSemverReleaseType(() => {})).toBe(true);

    expect(isNotSemverReleaseType('')).toBe(true);
    expect(isNotSemverReleaseType('next')).toBe(true);
    expect(isNotSemverReleaseType('new')).toBe(true);
    expect(isNotSemverReleaseType('latest')).toBe(true);
    expect(isNotSemverReleaseType('majority')).toBe(true);
    expect(isNotSemverReleaseType('minority')).toBe(true);
    expect(isNotSemverReleaseType('pat')).toBe(true);

    expect(isNotSemverReleaseType('MAJOR')).toBe(true);
    expect(isNotSemverReleaseType('major major')).toBe(true);
    expect(isNotSemverReleaseType('PREMAJOR')).toBe(true);

    expect(isNotSemverReleaseType('MINOR')).toBe(true);
    expect(isNotSemverReleaseType('minor minor')).toBe(true);
    expect(isNotSemverReleaseType('PREMINOR')).toBe(true);

    expect(isNotSemverReleaseType('PATCH')).toBe(true);
    expect(isNotSemverReleaseType('patch patch')).toBe(true);
    expect(isNotSemverReleaseType('PREPATCH')).toBe(true);

    expect(isNotSemverReleaseType('PRERELEASE')).toBe(true);
    expect(isNotSemverReleaseType('prerelease prerelease')).toBe(true);
  });
});

describe('Call of isNotSemver(value) should', () => {
  test('return true for any value except a non empty string', () => {
    expect.assertions(13);

    expect(isNotSemver(123)).toBe(true);
    expect(isNotSemver(NaN)).toBe(true);
    expect(isNotSemver(Infinity)).toBe(true);

    expect(isNotSemver(true)).toBe(true);
    expect(isNotSemver(false)).toBe(true);

    expect(isNotSemver([])).toBe(true);
    expect(isNotSemver({})).toBe(true);
    expect(isNotSemver(Symbol('s'))).toBe(true);

    expect(isNotSemver(() => {})).toBe(true);

    expect(isNotSemver(null)).toBe(true);
    expect(isNotSemver(undefined)).toBe(true);
    expect(isNotSemver()).toBe(true);

    expect(isNotSemver('')).toBe(true);
  });

  test('return true for a not valid semver number', () => {
    expect.assertions(8);

    expect(isNotSemver('v01.02.03')).toBe(true);
    expect(isNotSemver('01.02.03')).toBe(true);
    expect(isNotSemver('.1.3')).toBe(true);
    expect(isNotSemver('1.3')).toBe(true);
    expect(isNotSemver('3')).toBe(true);
    expect(isNotSemver('123')).toBe(true);
    expect(isNotSemver('HEAD')).toBe(true);
    expect(isNotSemver('head')).toBe(true);
  });

  test('return false for a valid semver number', () => {
    expect.assertions(6);

    expect(isNotSemver('v9.9.9')).toBe(false);
    expect(isNotSemver('v1.2.3')).toBe(false);
    expect(isNotSemver('v1.2.3-next.2.beta.0+build.exp')).toBe(false);

    expect(isNotSemver('9.9.9')).toBe(false);
    expect(isNotSemver('1.2.3')).toBe(false);
    expect(isNotSemver('1.2.3-next.2.beta.0+build.exp')).toBe(false);
  });
});

describe('Call of isNotArray(value) should', () => {
  test('return true for any value except an array', () => {
    expect.assertions(12);

    expect(isNotArray(123)).toBe(true);
    expect(isNotArray(NaN)).toBe(true);
    expect(isNotArray(Infinity)).toBe(true);

    expect(isNotArray(true)).toBe(true);
    expect(isNotArray(false)).toBe(true);

    expect(isNotArray({})).toBe(true);
    expect(isNotArray(Symbol('s'))).toBe(true);

    expect(isNotArray(() => {})).toBe(true);

    expect(isNotArray(null)).toBe(true);
    expect(isNotArray(undefined)).toBe(true);
    expect(isNotArray()).toBe(true);

    expect(isNotArray('')).toBe(true);
  });

  test('return false for any valid array value', () => {
    expect.assertions(4);

    expect(isNotArray([])).toBe(false);
    expect(isNotArray(['a', 'b', 'c'])).toBe(false);
    expect(isNotArray([1])).toBe(false);
    expect(isNotArray([[1],[2]])).toBe(false);
  });
});

describe('Call of isNotBoolean(value) should', () => {
  test('return true for any value except true or false', () => {
    expect.assertions(12);

    expect(isNotBoolean(123)).toBe(true);
    expect(isNotBoolean(NaN)).toBe(true);
    expect(isNotBoolean(Infinity)).toBe(true);

    expect(isNotBoolean({})).toBe(true);
    expect(isNotBoolean([])).toBe(true);
    expect(isNotBoolean(Symbol('s'))).toBe(true);

    expect(isNotBoolean(() => {})).toBe(true);

    expect(isNotBoolean(null)).toBe(true);
    expect(isNotBoolean(undefined)).toBe(true);

    expect(isNotBoolean('')).toBe(true);
    expect(isNotBoolean('true')).toBe(true);
    expect(isNotBoolean('false')).toBe(true);
  });

  test('return false for the values true and false', () => {
    expect.assertions(2);

    expect(isNotBoolean(true)).toBe(false);
    expect(isNotBoolean(false)).toBe(false);
  });
});

describe('Call of isNullish(value) should', () => {
  test('return true for a value equal to null or undefined', () => {
    expect.assertions(2);

    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
  });

  test('return false for any value except null or undefined', () => {
    expect.assertions(12);

    expect(isNullish(123)).toBe(false);
    expect(isNullish(NaN)).toBe(false);
    expect(isNullish(Infinity)).toBe(false);

    expect(isNullish(true)).toBe(false);
    expect(isNullish(false)).toBe(false);

    expect(isNullish({})).toBe(false);
    expect(isNullish([])).toBe(false);
    expect(isNullish(Symbol('s'))).toBe(false);

    expect(isNullish(() => {})).toBe(false);

    expect(isNullish('')).toBe(false);
    expect(isNullish('null')).toBe(false);
    expect(isNullish('undefined')).toBe(false);
  });
});

describe('Call of isEmptyString(value) should', () => {
  test('return true for an empty string value only', () => {
    expect.assertions(1);

    expect(isEmptyString('')).toBe(true);
  });

  test('return false for a non empty string value', () => {
    expect.assertions(10);

    expect(isEmptyString(123)).toBe(false);
    expect(isEmptyString(NaN)).toBe(false);
    expect(isEmptyString(Infinity)).toBe(false);

    expect(isEmptyString(true)).toBe(false);
    expect(isEmptyString(false)).toBe(false);

    expect(isEmptyString({})).toBe(false);
    expect(isEmptyString([])).toBe(false);
    expect(isEmptyString(Symbol('s'))).toBe(false);

    expect(isEmptyString(() => {})).toBe(false);

    expect(isEmptyString('hello')).toBe(false);
  });
});