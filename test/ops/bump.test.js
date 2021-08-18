'use strict';

const fs = require('fs');
const bump = require('../../lib/ops/bump');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const { readFile, writeFile } = fs.promises;
const { any } = expect;

beforeEach(() => {
  readFile.mockResolvedValue('{"version": "0.1.1"}');
  writeFile.mockResolvedValue();
});

afterEach(() => {
  readFile.mockReset();
  writeFile.mockReset();
});

describe('Bump should by an async operation', () => {
  test('getting as input a semver release type along with an optional preid', async () => {
    expect.assertions(7);

    await expect(bump('major')).resolves.toBeDefined();
    await expect(bump('minor')).resolves.toBeDefined();
    await expect(bump('patch')).resolves.toBeDefined();

    await expect(bump('premajor', 'alpha')).resolves.toBeDefined();
    await expect(bump('preminor', 'alpha')).resolves.toBeDefined();
    await expect(bump('prepatch', 'alpha')).resolves.toBeDefined();
    await expect(bump('prerelease', 'alpha')).resolves.toBeDefined();
  });

  test('where the release type arg should always be given a valid value', async () => {
    expect.assertions(7);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump()).rejects.toThrow(reason);
    await expect(bump('')).rejects.toThrow(reason);
    await expect(bump('next')).rejects.toThrow(reason);
    await expect(bump('MAJOR')).rejects.toThrow(reason);
    await expect(bump('major major')).rejects.toThrow(reason);

    expect(readFile).not.toBeCalled();
    expect(writeFile).not.toBeCalled();
  });

  test('resolving to an object with schema equal to { current, next, isPrerelease }', async () => {
    expect.assertions(1);

    await expect(bump('major')).resolves.toMatchObject({
      current: any(String),
      next: any(String),
      isPrerelease: any(Boolean)
    });
  });
});

describe('Bump should resolve', () => {
  test('updating the current version in the package.json file first', async () => {
    expect.assertions(3);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ current: '0.1.1' });

    expect(readFile).nthCalledWith(1, 'package.json', 'utf8');
    expect(writeFile).nthCalledWith(1, 'package.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('cleaning semver versions given in the v0.1.1 form', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "v0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ current: '0.1.1' });
  });

  test('updating the version in package lock files with the next version', async () => {
    expect.assertions(5);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(writeFile).toBeCalledWith('package-lock.json', '{\n  "version": "1.0.0"\n}\n');

    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');
    expect(writeFile).toBeCalledWith('npm-shrinkwrap.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('avoiding to update the version in a package lock file if not present', async () => {
    expect.assertions(5);

    const error = new Error("ENOENT: no such file or directory, open '*.json'");
    error.code = 'ENOENT';

    readFile.mockImplementation(async (filepath) => {
      switch (filepath) {
        case 'package.json':
          return '{"version": "0.1.1"}';
        case 'package-lock.json':
        case 'npm-shrinkwrap.json':
        default:
          throw error;
      }
    });

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(writeFile).not.toBeCalledWith('package-lock.json', any(String));

    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');
    expect(writeFile).not.toBeCalledWith('npm-shrinkwrap.json', any(String));
  });
});

describe('Bump called with a major release type and', () => {
  test.each([
    ['0.1.1', '1.0.0'],
    ['0.1.1-alpha.1', '1.0.0']
  ])('taken from %p should resolve to the stable version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('major')).resolves.toEqual({
      current, next, isPrerelease: false
    });
  });
});

describe('Bump called with a major release type along with an alpha preid and', () => {
  test.each([
    ['0.1.1', '1.0.0'],
    ['0.1.1-alpha.1', '1.0.0']
  ])('taken from %p should resolve to the stable version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('major', 'alpha')).resolves.toEqual({
      current, next, isPrerelease: false
    });
  });
});

describe('Bump called with a premajor release type along with an alpha preid and', () => {
  test.each([
    ['0.1.1', '1.0.0-alpha.0'],
    ['0.1.1-alpha.0', '1.0.0-alpha.0']
  ])('taken from %p should resolve to the prerelease version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('premajor', 'alpha')).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump called with a premajor release type without a preid and', () => {
  test.each([
    ['0.1.1', '1.0.0-0'],
    ['0.1.1-alpha.0', '1.0.0-0']
  ])('taken from %p should resolve to the prerelease version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('premajor')).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump called with a minor release type and', () => {
  test.each([
    ['0.1.1', '0.2.0'],
    ['0.1.1-alpha.1', '0.2.0']
  ])('taken from %p should resolve to the stable version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('minor')).resolves.toEqual({
      current, next, isPrerelease: false
    });
  });
});

describe('Bump called with a minor release type along with an alpha preid and', () => {
  test.each([
    ['0.1.1', '0.2.0'],
    ['0.1.1-alpha.1', '0.2.0']
  ])('taken from %p should resolve to the stable version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('minor', 'alpha')).resolves.toEqual({
      current, next, isPrerelease: false
    });
  });
});

describe('Bump called with a preminor release type along with an alpha preid and', () => {
  test.each([
    ['0.1.1', '0.2.0-alpha.0'],
    ['0.1.1-alpha.0', '0.2.0-alpha.0']
  ])('taken from %p should resolve to the prerelease version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('preminor', 'alpha')).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump called with a preminor release type without a preid and', () => {
  test.each([
    ['0.1.1', '0.2.0-0'],
    ['0.1.1-alpha.0', '0.2.0-0']
  ])('taken from %p should resolve to the prerelease version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('preminor')).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump called with a patch release type and', () => {
  test.each([
    ['0.1.1', '0.1.2'],
    ['0.1.1-alpha.1', '0.1.1']
  ])('taken from %p should resolve to the stable version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('patch')).resolves.toEqual({
      current, next, isPrerelease: false
    });
  });
});

describe('Bump called with a patch release type along with an alpha preid and', () => {
  test.each([
    ['0.1.1', '0.1.2'],
    ['0.1.1-alpha.1', '0.1.1']
  ])('taken from %p should resolve to the stable version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('patch', 'alpha')).resolves.toEqual({
      current, next, isPrerelease: false
    });
  });
});

describe('Bump called with a prepatch release type along with an alpha preid and', () => {
  test.each([
    ['0.1.1', '0.1.2-alpha.0'],
    ['0.1.1-alpha.0', '0.1.2-alpha.0']
  ])('taken from %p should resolve to the prerelease version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump called with a prepatch release type without a preid and', () => {
  test.each([
    ['0.1.1', '0.1.2-0'],
    ['0.1.1-alpha.0', '0.1.2-0']
  ])('taken from %p should resolve to the prerelease version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('prepatch')).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump called with a prerelease type without a preid and', () => {
  test.each([
    ['0.1.1', '0.1.2-0'],
    ['0.1.1-alpha.1', '0.1.1-alpha.2']
  ])('taken from %p should resolve to the prerelease version %p', async (current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('prerelease')).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump called with a prerelease type along with a preid', () => {
  test.each([
    ['alpha', '0.1.1', '0.1.2-alpha.0'],
    ['alpha', '0.1.1-alpha.1', '0.1.1-alpha.2'],
    ['beta', '0.1.1-alpha.1', '0.1.1-beta.0']
  ])('%p and taken from %p should resolve to the prerelease version %p', async (preid, current, next) => {
    expect.assertions(1);

    readFile.mockResolvedValue(`{"version": "${current}"}`);

    await expect(bump('prerelease', preid)).resolves.toEqual({
      current, next, isPrerelease: true
    });
  });
});

describe('Bump should reject with error', () => {
  test('when there is no package.json file found', async () => {
    expect.assertions(4);

    const reason = 'No such file or directory: package.json';

    readFile.mockRejectedValueOnce(new Error(reason));

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('package.json', 'utf8');

    expect(writeFile).not.toBeCalled();
  });

  test.each([
    ['{version: "123"', SyntaxError],
    ['123', 'Invalid or malformed JSON file: package.json'],
    ['{}', 'Invalid or missing semver version in JSON file: package.json'],
    ['{"version": "123"}', 'Invalid or missing semver version in JSON file: package.json']
  ])('when the content of the package.json file is %p', async (content, reason) => {
    expect.assertions(4);

    readFile.mockResolvedValueOnce(content);

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('package.json', 'utf8');

    expect(writeFile).not.toBeCalled();
  });

  test.each([
    'package-lock.json', 'npm-shrinkwrap.json'
  ])('when reading %p file throws a non ENOENT error', async (path) => {
    expect.assertions(2);

    const reason = `A fatal error occurred reading file: ${path}`;

    readFile.mockImplementation(async (filepath) => {
      if (filepath === path) {
        throw new Error(reason);
      }

      return '{"version": "1.0.0"}';
    });

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledWith(path, 'utf8');
  });
});