const {
  isGiven,
  isNotString,
  isNotHashOrTag,
  isNotSemverRelease
} = require('../lib/util/validators');

describe('Call of isGiven(value)', () => {
  test('should return true for any value except null and undefined', () => {
    expect.assertions(11);

    expect(isGiven(123)).toBe(true);
    expect(isGiven(NaN)).toBe(true);
    expect(isGiven(Infinity)).toBe(true);
    expect(isGiven(true)).toBe(true);
    expect(isGiven(false)).toBe(true);
    expect(isGiven([])).toBe(true);
    expect(isGiven({})).toBe(true);
    expect(isGiven(Symbol('s'))).toBe(true);
    expect(isGiven(() => {})).toBe(true);
    expect(isGiven('str')).toBe(true);
    expect(isGiven('')).toBe(true);
  });

  test('should return false for value equal to null or undefined', () => {
    expect.assertions(3);

    expect(isGiven(null)).toBe(false);
    expect(isGiven(undefined)).toBe(false);
    expect(isGiven()).toBe(false);
  });
});

describe('Call of isNotString(value)', () => {
  test('should return true for any value except a non empty string', () => {
    expect.assertions(13);

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
    expect(isNotString('')).toBe(true);
  });

  test('should return false for value equal to only a non empty string', () => {
    expect.assertions(1);

    expect(isNotString('str')).toBe(false);
  });
});

describe('Call of isNotHashOrTag(value)', () => {
  test('should return true for any value except a non empty string', () => {
    expect.assertions(13);

    expect(isNotHashOrTag(123)).toBe(true);
    expect(isNotHashOrTag(NaN)).toBe(true);
    expect(isNotHashOrTag(Infinity)).toBe(true);
    expect(isNotHashOrTag(true)).toBe(true);
    expect(isNotHashOrTag(false)).toBe(true);
    expect(isNotHashOrTag([])).toBe(true);
    expect(isNotHashOrTag({})).toBe(true);
    expect(isNotHashOrTag(Symbol('s'))).toBe(true);
    expect(isNotHashOrTag(() => {})).toBe(true);
    expect(isNotHashOrTag(null)).toBe(true);
    expect(isNotHashOrTag(undefined)).toBe(true);
    expect(isNotHashOrTag()).toBe(true);
    expect(isNotHashOrTag('')).toBe(true);
  });

  test('should return true for a not valid git commit hash (sha1)', () => {
    expect.assertions(20);

    expect(isNotHashOrTag('12s4')).toBe(true);
    expect(isNotHashOrTag('1.2s.4')).toBe(true);
    expect(isNotHashOrTag('a')).toBe(true);
    expect(isNotHashOrTag('4ec99f747f787984e7f7e94d56ef6309747b215f5')).toBe(true);

    expect(isNotHashOrTag('c71f64b^')).toBe(true);
    expect(isNotHashOrTag('c71f64b^^')).toBe(true);
    expect(isNotHashOrTag('c71f64b^2')).toBe(true);
    expect(isNotHashOrTag('^c71f64b')).toBe(true);
    expect(isNotHashOrTag('c71f64b~')).toBe(true);
    expect(isNotHashOrTag('c71f64b~~')).toBe(true);
    expect(isNotHashOrTag('c71f64b~2')).toBe(true);
    expect(isNotHashOrTag('~c71f64b')).toBe(true);

    expect(isNotHashOrTag('..')).toBe(true);
    expect(isNotHashOrTag('c71f64b..')).toBe(true);
    expect(isNotHashOrTag('c71f64b..c71f64b')).toBe(true);
    expect(isNotHashOrTag('..c71f64b')).toBe(true);

    expect(isNotHashOrTag('...')).toBe(true);
    expect(isNotHashOrTag('c71f64b...')).toBe(true);
    expect(isNotHashOrTag('c71f64b...c71f64b')).toBe(true);
    expect(isNotHashOrTag('...c71f64b')).toBe(true);
  });

  test('should return true for a not valid semver tag name', () => {
    expect.assertions(5);

    expect(isNotHashOrTag('v01.02.03')).toBe(true);
    expect(isNotHashOrTag('01.02.03')).toBe(true);
    expect(isNotHashOrTag('.1.3')).toBe(true);
    expect(isNotHashOrTag('3')).toBe(true);
    expect(isNotHashOrTag('123')).toBe(true);
  });

  test('should return false for a valid git commit hash (sha1)', () => {
    expect.assertions(3);

    expect(isNotHashOrTag('4ec99f747f787984e7f7e94d56ef6309747b215f')).toBe(false);
    expect(isNotHashOrTag('4ec99f7')).toBe(false);
    expect(isNotHashOrTag('4ec99')).toBe(false);
  });

  test('should return false for a valid semver tag name', () => {
    expect.assertions(6);

    expect(isNotHashOrTag('v9.9.9')).toBe(false);
    expect(isNotHashOrTag('v1.2.3')).toBe(false);
    expect(isNotHashOrTag('v1.2.3-next.2.beta.0+build.exp')).toBe(false);

    expect(isNotHashOrTag('9.9.9')).toBe(false);
    expect(isNotHashOrTag('1.2.3')).toBe(false);
    expect(isNotHashOrTag('1.2.3-next.2.beta.0+build.exp')).toBe(false);
  });
});

describe('Call of isNotSemverRelease(value)', () => {
  test('should return false for the string values `major`, `minor` and `patch`', () => {
    expect.assertions(6);

    expect(isNotSemverRelease('major')).toBe(false);
    expect(isNotSemverRelease('MAJOR')).toBe(false);
    expect(isNotSemverRelease('minor')).toBe(false);
    expect(isNotSemverRelease('MINOR')).toBe(false);
    expect(isNotSemverRelease('patch')).toBe(false);
    expect(isNotSemverRelease('PATCH')).toBe(false);
  });

  test('should return true for any value except `major`, `minor` and `patch`', () => {
    expect.assertions(19);

    expect(isNotSemverRelease()).toBe(true);
    expect(isNotSemverRelease(null)).toBe(true);
    expect(isNotSemverRelease(undefined)).toBe(true);

    expect(isNotSemverRelease(123)).toBe(true);
    expect(isNotSemverRelease(NaN)).toBe(true);
    expect(isNotSemverRelease(Infinity)).toBe(true);
    expect(isNotSemverRelease(true)).toBe(true);
    expect(isNotSemverRelease(false)).toBe(true);
    expect(isNotSemverRelease([])).toBe(true);
    expect(isNotSemverRelease({})).toBe(true);
    expect(isNotSemverRelease(Symbol('s'))).toBe(true);
    expect(isNotSemverRelease(() => {})).toBe(true);
    expect(isNotSemverRelease('')).toBe(true);

    expect(isNotSemverRelease('next')).toBe(true);
    expect(isNotSemverRelease('new')).toBe(true);
    expect(isNotSemverRelease('latest')).toBe(true);
    expect(isNotSemverRelease('majority')).toBe(true);
    expect(isNotSemverRelease('minority')).toBe(true);
    expect(isNotSemverRelease('pat')).toBe(true);
  });
});