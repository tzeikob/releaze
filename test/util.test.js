const { isGiven, isNotString } = require('../lib/util/validators');

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