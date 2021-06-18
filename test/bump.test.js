jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
  promises: {
    readFile: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
  }
}));

const fs = require('fs');
const bump = require('../lib/bump');

const { existsSync } = fs;
const { readFile, writeFile } = fs.promises;

const pathEndsWithPackageJSON = expect.stringMatching(/\/package.json$/);
const pathEndsWithPackageLockJSON = expect.stringMatching(/\/package-lock.json$/);
const pathEndsWithShrinkwrapJSON = expect.stringMatching(/\/npm-shrinkwrap.json$/);

const startsWithInvalidType = expect.stringMatching(/^Invalid or missing semver release type argument:/);
const startsWithInvalidJSON = expect.stringMatching(/^Invalid or malformed/);
const startsWithInvalidVersion = expect.stringMatching(/^Invalid or missing semver version in/);

afterEach(() => {
  existsSync.mockReset();
  existsSync.mockReturnValue(false);

  readFile.mockReset();
  writeFile.mockReset();
});

describe('Bump should reject with error', () => {
  test('when called with no release type argument', async () => {
    expect.assertions(8);

    await expect(bump()).rejects.toBeInstanceOf(Error);
    await expect(bump()).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(undefined)).rejects.toBeInstanceOf(Error);
    await expect(bump(undefined)).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(null)).rejects.toBeInstanceOf(Error);
    await expect(bump(null)).rejects.toHaveProperty('message', startsWithInvalidType);

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when called with not valid release type argument', async () => {
    expect.assertions(24);

    await expect(bump(123)).rejects.toBeInstanceOf(Error);
    await expect(bump(123)).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(NaN)).rejects.toBeInstanceOf(Error);
    await expect(bump(NaN)).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(Infinity)).rejects.toBeInstanceOf(Error);
    await expect(bump(Infinity)).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(true)).rejects.toBeInstanceOf(Error);
    await expect(bump(true)).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(false)).rejects.toBeInstanceOf(Error);
    await expect(bump(false)).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump([])).rejects.toBeInstanceOf(Error);
    await expect(bump([])).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump({})).rejects.toBeInstanceOf(Error);
    await expect(bump({})).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(() => {})).rejects.toBeInstanceOf(Error);
    await expect(bump(() => {})).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump('')).rejects.toBeInstanceOf(Error);
    await expect(bump('')).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump(() => {})).rejects.toBeInstanceOf(Error);
    await expect(bump(() => {})).rejects.toHaveProperty('message', startsWithInvalidType);

    await expect(bump('majo')).rejects.toBeInstanceOf(Error);
    await expect(bump('majo')).rejects.toHaveProperty('message', startsWithInvalidType);

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
    await expect(bump('major')).rejects.toHaveProperty('message', startsWithInvalidJSON);

    readFile.mockReturnValue(Promise.resolve('null'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', startsWithInvalidJSON);

    readFile.mockReturnValue(Promise.resolve('[]'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', startsWithInvalidJSON);

    expect(readFile).toHaveBeenCalledTimes(6);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file but has no or invalid semver version number', async () => {
    expect.assertions(6);

    readFile.mockReturnValue(Promise.resolve('{}'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', startsWithInvalidVersion);

    readFile.mockReturnValue(Promise.resolve('{"version": "123"}'));

    await expect(bump('major')).rejects.toBeInstanceOf(Error);
    await expect(bump('major')).rejects.toHaveProperty('message', startsWithInvalidVersion);

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
    expect(readFile).toHaveBeenCalledWith(pathEndsWithPackageJSON, 'utf8');
  });

  test('write once the new `current` version to the package.json file', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(pathEndsWithPackageJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('write also the new `current` version to the package-lock.json if present', async () => {
    expect.assertions(7);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    existsSync.mockImplementation((filepath) => filepath.endsWith('package-lock.json'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(existsSync).toHaveBeenCalledTimes(2);
    expect(writeFile).toHaveBeenCalledTimes(2);

    expect(existsSync).toHaveBeenCalledWith(pathEndsWithPackageLockJSON);
    expect(readFile).toHaveBeenCalledWith(pathEndsWithPackageLockJSON, 'utf8');
    expect(writeFile).toHaveBeenCalledWith(pathEndsWithPackageLockJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('write also the new `current` version to the npm-shrinkwrap.json if present', async () => {
    expect.assertions(7);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    existsSync.mockImplementation((filepath) => filepath.endsWith('npm-shrinkwrap.json'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(existsSync).toHaveBeenCalledTimes(2);
    expect(writeFile).toHaveBeenCalledTimes(2);

    expect(existsSync).toHaveBeenCalledWith(pathEndsWithShrinkwrapJSON);
    expect(readFile).toHaveBeenCalledWith(pathEndsWithShrinkwrapJSON, 'utf8');
    expect(writeFile).toHaveBeenCalledWith(pathEndsWithShrinkwrapJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('resolve to an object with props the `previous` and the new `current` semver versions', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
    await expect(bump('minor')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0' });
    await expect(bump('patch')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2' });
  });
});