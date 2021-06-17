jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
  }
}));

const fs = require('fs');
const bump = require('../lib/bump');

const { readFile, writeFile } = fs.promises;

const pathToPackageJSON = expect.stringMatching(/\/package.json$/);

afterEach(() => {
  readFile.mockReset();
  writeFile.mockReset();
});

describe('Bump should reject with error', () => {
  test('when called with no release type argument', async () => {
    expect.assertions(8);

    await expect(bump()).rejects.toBeInstanceOf(Error);
    await expect(bump()).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(undefined)).rejects.toBeInstanceOf(Error);
    await expect(bump(undefined)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    await expect(bump(null)).rejects.toBeInstanceOf(Error);
    await expect(bump(null)).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when called with not valid release type argument', async () => {
    expect.assertions(26);

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

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is no NPM package.json file', async () => {
    expect.assertions(4);

    const error = new Error("ENOENT: no such file or directory, open 'package.json'");
    error.errno = -2;
    error.code = 'ENOENT';
    error.syscall = 'open';
    error.path = 'package.json';

    readFile.mockReturnValue(Promise.reject(error));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', "ENOENT: no such file or directory, open 'package.json'");

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file but the content has invalid JSON syntax', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{version: "123"'));

    await expect(bump('major')).rejects.toBeInstanceOf(SyntaxError);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file which parsed to a not valid JSON object', async () => {
    expect.assertions(8);

    readFile.mockReturnValue(Promise.resolve('123'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', 'Invalid or malformed package.json');

    readFile.mockReturnValue(Promise.resolve('null'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', 'Invalid or malformed package.json');

    readFile.mockReturnValue(Promise.resolve('[]'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', 'Invalid or malformed package.json');

    expect(readFile).toHaveBeenCalledTimes(6);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file but has no or invalid semver version number', async () => {
    expect.assertions(6);

    readFile.mockReturnValue(Promise.resolve('{}'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', 'Invalid or missing semver version in package.json');

    readFile.mockReturnValue(Promise.resolve('{"version": "123"}'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', 'Invalid or missing semver version in package.json');

    expect(readFile).toHaveBeenCalledTimes(4);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });
});

describe('Bump called with a valid release type and package.json should', () => {
  test('read once from the package.json file', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
  });

  test('write once the new `current` version to the package.json file', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('resolve to an object with props to the `previous` and the new `current` semver versions', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
    await expect(bump('minor')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0' });
    await expect(bump('patch')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2' });
  });
});