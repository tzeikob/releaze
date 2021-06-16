jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(),
  }
}));

const { readFile } = require('fs').promises;

const bump = require('../lib/bump');

describe('Bump should reject with error', () => {
  test('when called with no release type argument', async () => {
    expect.assertions(6);

    await expect(bump()).rejects.toBeInstanceOf(Error);
    await expect(bump()).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(undefined)).rejects.toBeInstanceOf(Error);
    await expect(bump(undefined)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(null)).rejects.toBeInstanceOf(Error);
    await expect(bump(null)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');
  });

  test('when called with not valid release type argument', async () => {
    expect.assertions(24);

    await expect(bump(123)).rejects.toBeInstanceOf(Error);
    await expect(bump(123)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(NaN)).rejects.toBeInstanceOf(Error);
    await expect(bump(NaN)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(Infinity)).rejects.toBeInstanceOf(Error);
    await expect(bump(Infinity)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(true)).rejects.toBeInstanceOf(Error);
    await expect(bump(true)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(false)).rejects.toBeInstanceOf(Error);
    await expect(bump(false)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump([])).rejects.toBeInstanceOf(Error);
    await expect(bump([])).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump({})).rejects.toBeInstanceOf(Error);
    await expect(bump({})).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(Symbol('s'))).rejects.toBeInstanceOf(Error);
    await expect(bump(Symbol('s'))).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(() => {})).rejects.toBeInstanceOf(Error);
    await expect(bump(() => {})).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump('')).rejects.toBeInstanceOf(Error);
    await expect(bump('')).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(() => {})).rejects.toBeInstanceOf(Error);
    await expect(bump(() => {})).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump('majo')).rejects.toBeInstanceOf(Error);
    await expect(bump('majo')).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');
  });

  test('when there is no NPM package.json file', async () => {
    expect.assertions(2);

    const error = new Error("ENOENT: no such file or directory, open 'package.json'");
    error.errno = -2;
    error.code = 'ENOENT';
    error.syscall = 'open';
    error.path = 'package.json';

    readFile.mockReturnValue(Promise.reject(error));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', "ENOENT: no such file or directory, open 'package.json'");
  });
});