jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
  }
}));

const fs = require('fs');
const bump = require('../lib/bump');

const { readFile, writeFile } = fs.promises;

afterEach(() => {
  readFile.mockReset();
  writeFile.mockReset();
});

describe('Bump should reject early with error', () => {
  test('when called with no release type argument', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump()).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when called with not valid release type argument', async () => {
    expect.assertions(11);

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

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when there is no package.json file', async () => {
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

  test('when there is an package.json file which parsed to a not valid JSON object', async () => {
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

  test('when there is an package.json file but has no or invalid semver version number', async () => {
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

  test('when writing to package.json file failed', async () => {
    expect.assertions(5);

    readFile.mockResolvedValueOnce('{"version": "0.1.1"}');

    const reason = 'Unknown error writing to file: package.json';

    writeFile.mockRejectedValueOnce(new Error(reason));

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledTimes(1);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
    expect(writeFile).toBeCalledWith('package.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('when writing to existing package-lock.json file failed', async () => {
    expect.assertions(7);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    const reason = 'Unknown error writing to file: package-lock.json';

    writeFile
      .mockResolvedValueOnce('package.json updated successfully')
      .mockRejectedValueOnce(new Error(reason));

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(2);
    expect(writeFile).toBeCalledTimes(2);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');

    expect(writeFile).toBeCalledWith('package.json', '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toBeCalledWith('package-lock.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('when writing to existing npm-shrinkwrap.json file failed', async () => {
    expect.assertions(9);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    const reason = 'Unknown error writing to file: npm-shrinkwrap.json';

    writeFile
      .mockResolvedValueOnce('package.json updated successfully')
      .mockResolvedValueOnce('package-lock.json updated successfully')
      .mockRejectedValueOnce(new Error(reason));

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(3);
    expect(writeFile).toBeCalledTimes(3);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');

    expect(writeFile).toBeCalledWith('package.json', '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toBeCalledWith('package-lock.json', '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toBeCalledWith('npm-shrinkwrap.json', '{\n  "version": "1.0.0"\n}\n');
  });
});

describe('Bump called with a valid release type should', () => {
  test('read from package.json, package-lock.json and npm-shrinkwrap.json file', async () => {
    expect.assertions(5);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toBeCalledTimes(3);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');
  });

  test('write the new version to package.json, package-lock.json and npm-shrinkwrap.json file', async () => {
    expect.assertions(5);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toBeDefined();

    expect(writeFile).toBeCalledTimes(3);

    expect(writeFile).toBeCalledWith('package.json', '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toBeCalledWith('package-lock.json', '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toBeCalledWith('npm-shrinkwrap.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('ignore missing package-lock.json and npm-shrinkwrap.json files', async () => {
    expect.assertions(7);

    const error = new Error("ENOENT: no such file or directory, open '*.json'");
    error.code = 'ENOENT';

    readFile
      .mockResolvedValueOnce('{"version": "0.1.1"}')
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error);

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toBeCalledTimes(3);
    expect(writeFile).toBeCalledTimes(1);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');

    expect(writeFile).toBeCalledWith('package.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('should normalize versions given in alternative `v1.0.0` form to `1.0.0`', async () => {
    expect.assertions(1);
  
    readFile.mockResolvedValue('{"version": "v0.1.1"}');
  
    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
  });
});

describe('Bump called with a major release type should', () => {
  test('resolve to the next stable major version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
  });

  test('resolve to the next stable major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0' });
  });

  test('resolve to the next stable major version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('major')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '1.0.0' });
  });

  test('resolve to the next stable major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('major', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '1.0.0' });
  });
});

describe('Bump called with a pre major release type should', () => {
  test('resolve to the next pre alpha major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('premajor', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0-alpha.0' });
  });

  test('resolve to the next pre alpha major version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('premajor')).resolves.toEqual({ previous: '0.1.1', current: '1.0.0-0' });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('premajor', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '1.0.0-alpha.0' });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('premajor')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '1.0.0-0' });
  });
});

describe('Bump called with a minor release type should', () => {
  test('resolve to the next stable minor version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('minor')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0' });
  });

  test('resolve to the next stable minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('minor', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0' });
  });

  test('resolve to the next stable minor version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('minor')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.2.0' });
  });

  test('resolve to the next stable minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('minor', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.2.0' });
  });
});

describe('Bump called with a pre minor release type should', () => {
  test('resolve to the next pre alpha minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('preminor', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0-alpha.0' });
  });

  test('resolve to the next pre alpha minor version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('preminor')).resolves.toEqual({ previous: '0.1.1', current: '0.2.0-0' });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('preminor', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.2.0-alpha.0' });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('preminor')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.2.0-0' });
  });
});

describe('Bump called with a patch release type should', () => {
  test('resolve to the next stable patch version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('patch')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2' });
  });

  test('resolve to the next stable patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('patch', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2' });
  });

  test('resolve to the same stable patch version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('patch')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1' });
  });

  test('resolve to the same stable patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('patch', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1' });
  });
});

describe('Bump called with a pre patch release type should', () => {
  test('resolve to the next pre alpha patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-alpha.0' });
  });

  test('resolve to the next pre alpha patch version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prepatch')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-0' });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.1.2-alpha.0' });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('prepatch')).resolves.toEqual({ previous: '0.1.1-alpha.0', current: '0.1.2-0' });
  });
});

describe('Bump called with a pre release type should', () => {
  test('resolve to the next alpha version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prerelease')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-0' });
  });

  test('resolve to the next alpha version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({ previous: '0.1.1', current: '0.1.2-alpha.0' });
  });

  test('resolve to the next alpha version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1-alpha.2' });
  });

  test('resolve to the next alpha version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1-alpha.2' });
  });

  test('resolve to the next beta version taken from an alpha version given the beta `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease', 'beta')).resolves.toEqual({ previous: '0.1.1-alpha.1', current: '0.1.1-beta.0' });
  });
});