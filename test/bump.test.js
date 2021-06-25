jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
  }
}));

const fs = require('fs');
const path = require('path');
const bump = require('../lib/bump');

const { readFile, writeFile } = fs.promises;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');
const pathToPackageLockJSON = path.join(process.cwd(), 'package-lock.json');
const pathToShrinkwrapJSON = path.join(process.cwd(), 'npm-shrinkwrap.json');

afterEach(() => {
  readFile.mockReset();
  writeFile.mockReset();
});

describe('Bump should reject with error', () => {
  test('very early when called with no release type argument', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing semver release type argument';
    await expect(bump()).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('very early when called with not valid release type argument', async () => {
    expect.assertions(19);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump('')).rejects.toThrow(reason);
    await expect(bump('majo')).rejects.toThrow(reason);
    await expect(bump('MAJOR')).rejects.toThrow(reason);
    await expect(bump('PREMAJOR')).rejects.toThrow(reason);
    await expect(bump('MINOR')).rejects.toThrow(reason);
    await expect(bump('PREMINOR')).rejects.toThrow(reason);
    await expect(bump('PATCH')).rejects.toThrow(reason);
    await expect(bump('PREPATCH')).rejects.toThrow(reason);
    await expect(bump('PRERELEASE')).rejects.toThrow(reason);

    await expect(bump(123)).rejects.toThrow(reason);
    await expect(bump(NaN)).rejects.toThrow(reason);
    await expect(bump(Infinity)).rejects.toThrow(reason);
    await expect(bump(true)).rejects.toThrow(reason);

    await expect(bump([])).rejects.toThrow(reason);
    await expect(bump({})).rejects.toThrow(reason);
    await expect(bump(Symbol('s'))).rejects.toThrow(reason);
    await expect(bump(() => {})).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('very early when called with a non string `preid` key', async () => {
    expect.assertions(8);

    const reason = 'Invalid non string preid key for a pre based bump';

    await expect(bump('prerelease', 123)).rejects.toThrow(reason);
    await expect(bump('prerelease', true)).rejects.toThrow(reason);
    await expect(bump('prerelease', [])).rejects.toThrow(reason);
    await expect(bump('prerelease', {})).rejects.toThrow(reason);
    await expect(bump('prerelease', Symbol('s'))).rejects.toThrow(reason);
    await expect(bump('prerelease', () => {})).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(0);
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is no NPM package.json file', async () => {
    expect.assertions(4);

    const error = new Error("ENOENT: no such file or directory, open 'package.json'");

    readFile.mockReturnValue(Promise.reject(error));

    await expect(bump('major')).rejects.toThrow(error);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file but the content has invalid JSON syntax', async () => {
    expect.assertions(4);

    readFile.mockReturnValue(Promise.resolve('{version: "123"'));

    await expect(bump('major')).rejects.toThrow(SyntaxError);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file which parsed to a not valid JSON object', async () => {
    expect.assertions(6);

    const reason = `Invalid or malformed JSON file: ${pathToPackageJSON}`;

    readFile.mockReturnValue(Promise.resolve('123'));
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockReturnValue(Promise.resolve('null'));
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockReturnValue(Promise.resolve('[]'));
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(3);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when there is an NPM package.json file but has no or invalid semver version number', async () => {
    expect.assertions(5);

    const reason = `Invalid or missing semver version in JSON file: ${pathToPackageJSON}`;

    readFile.mockReturnValue(Promise.resolve('{}'));
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockReturnValue(Promise.resolve('{"version": "123"}'));
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(writeFile).toHaveBeenCalledTimes(0);
  });

  test('when writing to package.json file failed', async () => {
    expect.assertions(5);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    const error = new Error('Unknown error writing to file');

    writeFile.mockReturnValue(Promise.reject(error));

    await expect(bump('major')).rejects.toThrow(error);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('when writing to existing package-lock.json file failed', async () => {
    expect.assertions(7);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    const error = new Error('Unknown error writing to file');

    writeFile
      .mockReturnValueOnce(Promise.resolve())
      .mockReturnValueOnce(Promise.reject(error));

    await expect(bump('major')).rejects.toThrow(error);

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(readFile).toHaveBeenCalledWith(pathToPackageLockJSON, 'utf8');

    expect(writeFile).toHaveBeenCalledTimes(2);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageJSON, '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toHaveBeenCalledWith(pathToPackageLockJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('when writing to existing npm-shrinkwrap.json file failed', async () => {
    expect.assertions(9);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    const error = new Error('Unknown error writing to file');

    writeFile
      .mockReturnValueOnce(Promise.resolve())
      .mockReturnValueOnce(Promise.resolve())
      .mockReturnValueOnce(Promise.reject(error));

    await expect(bump('major')).rejects.toThrow(error);

    expect(readFile).toHaveBeenCalledTimes(3);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(readFile).toHaveBeenCalledWith(pathToPackageLockJSON, 'utf8');
    expect(readFile).toHaveBeenCalledWith(pathToShrinkwrapJSON, 'utf8');

    expect(writeFile).toHaveBeenCalledTimes(3);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageJSON, '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toHaveBeenCalledWith(pathToPackageLockJSON, '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toHaveBeenCalledWith(pathToShrinkwrapJSON, '{\n  "version": "1.0.0"\n}\n');
  });
});

describe('Bump called with a valid release type should', () => {
  test('read from package.json, package-lock.json and npm-shrinkwrap.json file', async () => {
    expect.assertions(5);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toHaveBeenCalledTimes(3);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(readFile).toHaveBeenCalledWith(pathToPackageLockJSON, 'utf8');
    expect(readFile).toHaveBeenCalledWith(pathToShrinkwrapJSON, 'utf8');
  });

  test('write the new version to package.json, package-lock.json and npm-shrinkwrap.json file', async () => {
    expect.assertions(5);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toBeDefined();

    expect(writeFile).toHaveBeenCalledTimes(3);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageJSON, '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toHaveBeenCalledWith(pathToPackageLockJSON, '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toHaveBeenCalledWith(pathToShrinkwrapJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('ignore missing package-lock.json and npm-shrinkwrap.json files if not present', async () => {
    expect.assertions(7);

    const error = new Error("ENOENT: no such file or directory, open '*.json'");
    error.code = 'ENOENT';

    readFile
      .mockReturnValueOnce(Promise.resolve('{"version": "0.1.1"}'))
      .mockReturnValueOnce(Promise.reject(error))
      .mockReturnValueOnce(Promise.reject(error));

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toHaveBeenCalledTimes(3);
    expect(readFile).toHaveBeenCalledWith(pathToPackageJSON, 'utf8');
    expect(readFile).toHaveBeenCalledWith(pathToPackageLockJSON, 'utf8');
    expect(readFile).toHaveBeenCalledWith(pathToShrinkwrapJSON, 'utf8');

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(pathToPackageJSON, '{\n  "version": "1.0.0"\n}\n');
  });

  test('should normalize versions given in alternative `v1.0.0` form to `1.0.0`', async () => {
    expect.assertions(1);
  
    readFile.mockReturnValue(Promise.resolve('{"version": "v0.1.1"}'));
  
    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
  });
});

describe('Bump called with a major release type should', () => {
  test('resolve to the next stable major version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
  });

  test('resolve to the next stable major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('major', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
  });

  test('resolve to the next stable major version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '1.0.0' });
  });

  test('resolve to the next stable major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('major', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '1.0.0' });
  });
});

describe('Bump called with a pre major release type should', () => {
  test('resolve to the next pre alpha major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('premajor', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0-alpha.0' });
  });

  test('resolve to the next pre alpha major version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('premajor')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0-0' });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.0"}'));

    await expect(bump('premajor', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '1.0.0-alpha.0' });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.0"}'));

    await expect(bump('premajor')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '1.0.0-0' });
  });
});

describe('Bump called with a minor release type should', () => {
  test('resolve to the next stable minor version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('minor')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0' });
  });

  test('resolve to the next stable minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('minor', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0' });
  });

  test('resolve to the next stable minor version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('minor')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.2.0' });
  });

  test('resolve to the next stable minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('minor', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.2.0' });
  });
});

describe('Bump called with a pre minor release type should', () => {
  test('resolve to the next pre alpha minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('preminor', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0-alpha.0' });
  });

  test('resolve to the next pre alpha minor version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('preminor')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0-0' });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.0"}'));

    await expect(bump('preminor', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.2.0-alpha.0' });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.0"}'));

    await expect(bump('preminor')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.2.0-0' });
  });
});

describe('Bump called with a patch release type should', () => {
  test('resolve to the next stable patch version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('patch')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2' });
  });

  test('resolve to the next stable patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('patch', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2' });
  });

  test('resolve to the same stable patch version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('patch')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1' });
  });

  test('resolve to the same stable patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('patch', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1' });
  });
});

describe('Bump called with a pre patch release type should', () => {
  test('resolve to the next pre alpha patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-alpha.0' });
  });

  test('resolve to the next pre alpha patch version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('prepatch')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-0' });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.0"}'));

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.1.2-alpha.0' });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.0"}'));

    await expect(bump('prepatch')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.1.2-0' });
  });
});

describe('Bump called with a pre release type should', () => {
  test('resolve to the next alpha version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('prerelease')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-0' });
  });

  test('resolve to the next alpha version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1"}'));

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-alpha.0' });
  });

  test('resolve to the next alpha version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('prerelease')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1-alpha.2' });
  });

  test('resolve to the next alpha version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1-alpha.2' });
  });

  test('resolve to the next beta version taken from an alpha version given the beta `preid`', async () => {
    expect.assertions(1);

    readFile.mockReturnValue(Promise.resolve('{"version": "0.1.1-alpha.1"}'));

    await expect(bump('prerelease', 'beta')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1-beta.0' });
  });
});