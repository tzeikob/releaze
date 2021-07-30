'use strict';

const semver = require('semver');
const exec = require('../../lib/util/exec');
const logger = require('../../lib/util/logger');
const tag = require('../../lib/ops/tag.js');

jest.mock('../../lib/util/exec', () => jest.fn());

jest.mock('../../lib/util/logger', () => ({
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn()
}));

const { any } = expect;

beforeEach(() => {
  exec.mockImplementation(async (file, args) => {
    const command = [file, ...args].join(' ');

    if (command.startsWith('git commit')) {
      return '[master d3f884f] message'
    }
  });
});

afterEach(() => {
  exec.mockReset();

  logger.info.mockReset();
  logger.success.mockReset();
  logger.error.mockReset();

  delete global.verbose;
});

describe('Tag should be an async operation', () => {
  test('getting as input a version arg', async () => {
    expect.assertions(1);

    await expect(tag('v1.0.0')).resolves.toBeDefined();
  });

  test('where version arg should always be given', async () => {
    expect.assertions(2);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag()).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });

  test('where version arg should be a valid semver version number', async () => {
    expect.assertions(8);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag('123')).rejects.toThrow(reason);
    await expect(tag('1.3')).rejects.toThrow(reason);
    await expect(tag('1.alpha.3')).rejects.toThrow(reason);
    await expect(tag('alpha')).rejects.toThrow(reason);
    await expect(tag('')).rejects.toThrow(reason);
    await expect(tag(null)).rejects.toThrow(reason);
    await expect(tag(123)).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });

  test('getting an optional message arg', async () => {
    expect.assertions(1);

    await expect(tag('v1.0.0', 'Bump to v1.0.0')).resolves.toBeDefined();
  });

  test('resolving to an object with name and hash props', async () => {
    expect.assertions(1);

    await expect(tag('v1.0.0')).resolves.toMatchObject({
      name: any(String),
      hash: any(String)
    });
  });
});

describe('Tag should resolve', () => {
  test('have git add, commit and tag commands executed in that given order', async () => {
    expect.assertions(8);

    await expect(tag('1.0.0')).resolves.toEqual({ name: 'v1.0.0', hash: 'd3f884f' });

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });

  test('even if the CHANGELOG.md file is missing and so failed to be staged', async () => {
    expect.assertions(8);

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command === 'git add CHANGELOG.md') {
        throw new Error('Failed to stage file: CHANGELOG.md');
      } else if (command.startsWith('git commit')) {
        return '[master d3f884f] message'
      }
    });

    await expect(tag('1.0.0')).resolves.toEqual({ name: 'v1.0.0', hash: 'd3f884f' });

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });

  test('even if package lock files are missing and so failed to be staged', async () => {
    expect.assertions(8);

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command.match(/git add (package-lock|npm-shrinkwrap).json/)) {
        throw new Error('Failed to stage file: lock file');
      } else if (command.startsWith('git commit')) {
        return '[master d3f884f] message'
      }
    });

    await expect(tag('1.0.0')).resolves.toEqual({ name: 'v1.0.0', hash: 'd3f884f' });

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });
});

describe('Tag should try to commit changes', () => {
  test('with the default message if message arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to v${version}`]);
  });

  test('with message equal to the given message arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump to new version ${version}`;

    await expect(tag(version, message)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', message]);
  });

  test('with template message using interpolation via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to new v${version}`]);
  });

  test('with version injected into the message template in a clean semver form', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to new v${semver.clean(version)}`]);
  });
});

describe('Tag should try to create an annotation tag', () => {
  test('with tag name equal to the given version arg in the `v1.0.0` form', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', `v${version}`, '-m', any(String)]);
  });

  test('having the given version arg be cleaned via semver before used as tag name', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';

    await expect(tag(version)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', `v${semver.clean(version)}`, '-m', any(String)]);
  });

  test('with the default message if the message arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to v${version}`]);
  });

  test('with message equal to the given message arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump to new version ${version}`;

    await expect(tag(version, message)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', message]);
  });

  test('with a template message using interpolation via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to new v${version}`]);
  });

  test('having the given version arg be cleaned via semver before used in the template message', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeDefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to new v${semver.clean(version)}`]);
  });
});

describe('Tag should report to console via logger', () => {
  test('when the verbose property has been enabled globally', async () => {
    expect.assertions(8);

    global.verbose = true;

    await expect(tag('v1.0.0')).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(6);

    expect(logger.info).nthCalledWith(1, 'File package.json has been staged.', 2);
    expect(logger.info).nthCalledWith(2, 'File CHANGELOG.md has been staged.', 2);
    expect(logger.info).nthCalledWith(3, 'File package-lock.json has been staged.', 2);
    expect(logger.info).nthCalledWith(4, 'File npm-shrinkwrap.json has been staged.', 2);
    expect(logger.info).nthCalledWith(5, 'All files have been committed:', 2);
    expect(logger.info).nthCalledWith(6, '[master d3f884f] message', 4);
  });

  test('except when the verbose property is not set globally', async () => {
    expect.assertions(4);

    await expect(tag('v1.0.0')).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(0);
    expect(logger.success).toBeCalledTimes(0);
    expect(logger.error).toBeCalledTimes(0);
  });
});

describe('Tag should reject with an error', () => {
  test('when `git add package.json` throws a fatal exec error', async () => {
    expect.assertions(3);

    const reason = 'A fatal error occurred executing: git add package.json';

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command === 'git add package.json') {
        throw new Error(reason);
      }
    });

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['add', 'package.json']);
  });

  test('when `git commit` throws a fatal exec error', async () => {
    expect.assertions(7);

    const reason = 'A fatal error occurred executing: git commit';

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command.startsWith('git commit')) {
        throw new Error(reason);
      }
    });

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(5);
  
    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
  });

  test('when `git tag` throws a fatal exec error', async () => {
    expect.assertions(8);

    const reason = 'A fatal error occurred executing: git tag';

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command.startsWith('git commit')) {
        return '[master d3f884f] message'
      } else if (command.startsWith('git tag')) {
        throw new Error(reason);
      }
    });

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });
});