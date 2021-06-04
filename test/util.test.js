const { isGiven, isNotString } = require('../lib/util/validators');

describe('call to util/validators.isGiven(value)', () => {
  test('should return true for any value except null, undefined or empty string', () => {
    expect.assertions(10);

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
  });

  test('should return false for value equal to null, undefined or empty string', () => {
    expect.assertions(4);

    expect(isGiven(null)).toBe(false);
    expect(isGiven(undefined)).toBe(false);
    expect(isGiven()).toBe(false);
    expect(isGiven('')).toBe(false);
  });
});

describe('call to util/validators.isNotString(value)', () => {
  test('should return true for any value except a string', () => {
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

  test('should return false for value equal to a string or empty string', () => {
    expect.assertions(2);

    expect(isNotString('str')).toBe(false);
    expect(isNotString('')).toBe(false);
  });
});