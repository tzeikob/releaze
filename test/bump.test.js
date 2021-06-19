jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
  promises: {
    readFile: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
  }
}));

const fs = require('fs');
const path = require('path');
const bump = require('../lib/bump');

const { existsSync } = fs;
const { readFile, writeFile } = fs.promises;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');
const pathToPackageLockJSON = path.join(process.cwd(), 'package-lock.json');
const pathToShrinkwrapJSON = path.join(process.cwd(), 'npm-shrinkwrap.json');

afterEach(() => {
  existsSync.mockReset();
  existsSync.mockReturnValue(false);

  readFile.mockReset();
  writeFile.mockReset();
});

describe('Bump should reject with error', () => {
  test('very early when called with no release type argument', async () => {
    expect.assertions(4);

    const reason = 'Invalid or missing semver release type argument';
    await expect(bump()).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(existsSync).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('very early when called with not valid release type argument', async () => {
    expect.assertions(13);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump('')).rejects.toThrow(reason);
    await expect(bump('majo')).rejects.toThrow(reason);

    await expect(bump(123)).rejects.toThrow(reason);
    await expect(bump(NaN)).rejects.toThrow(reason);
    await expect(bump(Infinity)).rejects.toThrow(reason);
    await expect(bump(true)).rejects.toThrow(reason);

    await expect(bump([])).rejects.toThrow(reason);
    await expect(bump({})).rejects.toThrow(reason);
    await expect(bump(Symbol('s'))).rejects.toThrow(reason);
    await expect(bump(() => {})).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(existsSync).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is no NPM package.json file', async () => {
    expect.assertions(5);

    const error = new Error("ENOENT: no such file or directory, open 'package.json'");

    readFile.mockReturnValue(Promise.reject(error));

    await expect(bump('major')).rejects.toThrow(error);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(existsSync).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file but the content has invalid JSON syntax', async () => {
    expect.assertions(5);

    readFile.mockReturnValue(Promise.resolve('{version: "123"'));

    await expect(bump('major')).rejects.toThrow(SyntaxError);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(existsSync).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file which parsed to a not valid JSON object', async () => {
    expect.assertions(7);

    const reason = `Invalid or malformed JSON file: ${pathToPackageJSON}`;

    readFile.mockReturnValue(Promise.resolve('123'));
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockReturnValue(Promise.resolve('null'));
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockReturnValue(Promise.resolve('[]'));
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(3);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(existsSync).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file but has no or invalid semver version number', async () => {
    expect.assertions(6);

    const reason = `Invalid or missing semver version in JSON file: ${pathToPackageJSON}`;

    readFile.mockReturnValue(Promise.resolve('{}'));
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockReturnValue(Promise.resolve('{"version": "123"}'));
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(existsSync).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });
});

describe('Bump called with a valid release type and package.json should', () => {
  test('read once from the package.json file', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
  });

  test('write once the new `current` version to the package.json file', async () => {
    expect.assertions(3);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toBeDefined();

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('write also the new `current` version to the package-lock.json if present', async () => {
    expect.assertions(7);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    existsSync.mockImplementation((filepath) => filepath.endsWith('package-lock.json'));

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(readFile).toHaveBeenCalledWith(pathToPackageLockJSON, 'utf8');

    expect(existsSync).toHaveBeenCalledTimes(2);
    expect(existsSync).toHaveBeenCalledWith(pathToPackageLockJSON);

    expect(writeFile).toHaveBeenCalledTimes(2);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageLockJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('write also the new `current` version to the npm-shrinkwrap.json if present', async () => {
    expect.assertions(7);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    existsSync.mockImplementation((filepath) => filepath.endsWith('npm-shrinkwrap.json'));

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(readFile).toHaveBeenCalledWith(pathToShrinkwrapJSON, 'utf8');

    expect(existsSync).toHaveBeenCalledTimes(2);
    expect(existsSync).toHaveBeenCalledWith(pathToShrinkwrapJSON);

    expect(writeFile).toHaveBeenCalledTimes(2);
    expect(writeFile).toHaveBeenCalledWith(pathToShrinkwrapJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('resolve to an object with `current` version equal to the major bumped `previous` version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
  });

  test('resolve to an object with `current` version equal to the minor bumped `previous` version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('minor')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0' });
  });

  test('resolve to an object with `current` version equal to the patch bumped `previous` version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('patch')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2' });
  });
});