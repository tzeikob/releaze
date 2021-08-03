'use strict';

const fs = require('fs');
const logger = require('../../lib/util/logger');
const bump = require('../../lib/ops/bump');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

jest.mock('../../lib/util/logger', () => ({
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn()
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

  logger.info.mockReset();
  logger.success.mockReset();
  logger.error.mockReset();

  delete global.verbose;
});

describe('Bump should by an async operation', () => {
  test('getting as input any semver stable release type', async () => {
    expect.assertions(3);

    await expect(bump('major')).resolves.toBeDefined();
    await expect(bump('minor')).resolves.toBeDefined();
    await expect(bump('patch')).resolves.toBeDefined();
  });

  test('getting as input any semver prerelease release type along with its preid', async () => {
    expect.assertions(4);

    await expect(bump('premajor', 'alpha')).resolves.toBeDefined();
    await expect(bump('preminor', 'alpha')).resolves.toBeDefined();
    await expect(bump('prepatch', 'alpha')).resolves.toBeDefined();
    await expect(bump('prerelease', 'alpha')).resolves.toBeDefined();
  });

  test('where the release type arg should always be given', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump()).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('where the release type arg should be any (pre)major, (pre)minor, (pre)patch or prerelease value', async () => {
    expect.assertions(15);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump('')).rejects.toThrow(reason);
    await expect(bump('alpha')).rejects.toThrow(reason);
    await expect(bump('MAJOR')).rejects.toThrow(reason);
    await expect(bump('PREMAJOR')).rejects.toThrow(reason);
    await expect(bump('MINOR')).rejects.toThrow(reason);
    await expect(bump('PREMINOR')).rejects.toThrow(reason);
    await expect(bump('PATCH')).rejects.toThrow(reason);
    await expect(bump('PREPATCH')).rejects.toThrow(reason);
    await expect(bump('PRERELEASE')).rejects.toThrow(reason);

    await expect(bump('major major')).rejects.toThrow(reason);
    await expect(bump('minor minor')).rejects.toThrow(reason);
    await expect(bump('patch patch')).rejects.toThrow(reason);
    await expect(bump('prerelease prerelease')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('resolving to an object with schema equal to `{ current, next, isPrerelease }`', async () => {
    expect.assertions(1);

    await expect(bump('major')).resolves.toMatchObject({
      current: any(String),
      next: any(String),
      isPrerelease: any(Boolean)
    });
  });

  test('reading first the current version from the package.json file', async () => {
    expect.assertions(2);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ current: '0.1.1' });

    expect(readFile).nthCalledWith(1, 'package.json', 'utf8');
  });

  test('cleaning semver versions given in prefixed `v0.1.1` form to `0.1.1`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "v0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ current: '0.1.1' });
  });

  test('resolving the next version with respect to release type and current version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ next: '1.0.0' });
  });

  test('resolving if the type of release is prerelease or not (stable)', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prerelease')).resolves.toMatchObject({ isPrerelease: true });
  });

  test('updating the prop version in package.json file with the next version', async () => {
    expect.assertions(2);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toBeDefined();

    expect(writeFile).toBeCalledWith('package.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('updating the prop version in any package lock files if present', async () => {
    expect.assertions(5);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');

    expect(writeFile).toBeCalledWith('package-lock.json', '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toBeCalledWith('npm-shrinkwrap.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('avoiding to update the prop version in a package lock file if not present', async () => {
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
    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');

    expect(writeFile).not.toBeCalledWith('package-lock.json', any(String));
    expect(writeFile).not.toBeCalledWith('npm-shrinkwrap.json', any(String));
  });
});

describe('Bump called with a major release type should', () => {
  test('resolve to the next stable major version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0',
      isPrerelease: false
    });
  });

  test('resolve to the next stable major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0',
      isPrerelease: false
    });
  });

  test('resolve to the next stable major version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('major')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '1.0.0',
      isPrerelease: false
    });
  });

  test('resolve to the next stable major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('major', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '1.0.0',
      isPrerelease: false
    });
  });
});

describe('Bump called with a pre major release type should', () => {
  test('resolve to the next pre alpha major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('premajor', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0-alpha.0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha major version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('premajor')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0-0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('premajor', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '1.0.0-alpha.0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('premajor')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '1.0.0-0',
      isPrerelease: true
    });
  });
});

describe('Bump called with a minor release type should', () => {
  test('resolve to the next stable minor version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('minor')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0',
      isPrerelease: false
    });
  });

  test('resolve to the next stable minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('minor', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0',
      isPrerelease: false
    });
  });

  test('resolve to the next stable minor version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('minor')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.2.0',
      isPrerelease: false
    });
  });

  test('resolve to the next stable minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('minor', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.2.0',
      isPrerelease: false
    });
  });
});

describe('Bump called with a pre minor release type should', () => {
  test('resolve to the next pre alpha minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('preminor', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0-alpha.0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha minor version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('preminor')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0-0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('preminor', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.2.0-alpha.0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('preminor')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.2.0-0',
      isPrerelease: true
    });
  });
});

describe('Bump called with a patch release type should', () => {
  test('resolve to the next stable patch version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('patch')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2',
      isPrerelease: false
    });
  });

  test('resolve to the next stable patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('patch', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2',
      isPrerelease: false
    });
  });

  test('resolve to the same stable patch version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('patch')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1',
      isPrerelease: false
    });
  });

  test('resolve to the same stable patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('patch', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1',
      isPrerelease: false
    });
  });
});

describe('Bump called with a pre patch release type should', () => {
  test('resolve to the next pre alpha patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-alpha.0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha patch version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prepatch')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.1.2-alpha.0',
      isPrerelease: true
    });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('prepatch')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.1.2-0',
      isPrerelease: true
    });
  });
});

describe('Bump called with a pre release type should', () => {
  test('resolve to the next alpha version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prerelease')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-0',
      isPrerelease: true
    });
  });

  test('resolve to the next alpha version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-alpha.0',
      isPrerelease: true
    });
  });

  test('resolve to the next alpha version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1-alpha.2',
      isPrerelease: true
    });
  });

  test('resolve to the next alpha version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1-alpha.2',
      isPrerelease: true
    });
  });

  test('resolve to the next beta version taken from an alpha version given the beta `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease', 'beta')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1-beta.0',
      isPrerelease: true
    });
  });
});

describe('Bump should report to console via logger', () => {
  test('only when the verbose property has been enabled globally', async () => {
    expect.assertions(8);

    readFile.mockResolvedValue('{ "version": "1.0.0" }');

    global.verbose = true;

    await expect(bump('premajor', 'alpha')).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(6);

    expect(logger.info).nthCalledWith(1, 'File package.json has been updated to new version:', 1);
    expect(logger.info).nthCalledWith(2, `{ "version": "1.0.0" } \u2192 { "version": "2.0.0-alpha.0" }`, 2);

    expect(logger.info).nthCalledWith(3, 'File package-lock.json has been updated to new version:', 1);
    expect(logger.info).nthCalledWith(4, `{ "version": "1.0.0" } \u2192 { "version": "2.0.0-alpha.0" }`, 2);

    expect(logger.info).nthCalledWith(5, 'File npm-shrinkwrap.json has been updated to new version:', 1);
    expect(logger.info).nthCalledWith(6, `{ "version": "1.0.0" } \u2192 { "version": "2.0.0-alpha.0" }`, 2);
  });

  test('except when the verbose property is not set globally', async () => {
    expect.assertions(4);

    readFile.mockResolvedValue('{ "version": "1.0.0" }');

    await expect(bump('premajor', 'alpha')).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(0);
    expect(logger.success).toBeCalledTimes(0);
    expect(logger.error).toBeCalledTimes(0);
  });
});

describe('Bump should reject with error', () => {
  test('when there is no package.json file found', async () => {
    expect.assertions(4);

    const reason = 'No such file or directory: package.json';

    readFile.mockRejectedValueOnce(new Error(reason));

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('when there is an package.json file but the content has invalid JSON syntax', async () => {
    expect.assertions(4);

    readFile.mockResolvedValueOnce('{version: "123"');

    await expect(bump('major')).rejects.toThrow(SyntaxError);

    expect(readFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('when there is a package.json file which parsed to a not valid JSON object', async () => {
    expect.assertions(6);

    const reason = 'Invalid or malformed JSON file: package.json';

    readFile.mockResolvedValueOnce('123');
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockResolvedValueOnce('null');
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockResolvedValueOnce('[]');
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(3);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('when there is a package.json file but has no or invalid semver version number', async () => {
    expect.assertions(5);

    const reason = 'Invalid or missing semver version in JSON file: package.json';

    readFile.mockResolvedValueOnce('{}');
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockResolvedValueOnce('{"version": "123"}');
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(2);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });
  
  test('when reading package-lock.json file throws any non `ENOENT` errors', async () => {
    expect.assertions(2);

    const reason = 'A fatal error occurred reading file: package-lock.json';

    readFile.mockImplementation(async (filepath) => {
      if (filepath === 'package-lock.json') {
        throw new Error(reason);
      }

      return '{"version": "1.0.0"}';
    });

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
  });
  
  test('when reading npm-shrinkwrap.json file throws any non `ENOENT` errors', async () => {
    expect.assertions(2);

    const reason = 'A fatal error occurred reading file: npm-shrinkwrap.json';

    readFile.mockImplementation(async (filepath) => {
      if (filepath === 'npm-shrinkwrap.json') {
        throw new Error(reason);
      }

      return '{"version": "1.0.0"}';
    });

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');
  });
});