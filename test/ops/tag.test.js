'use strict';

const semver = require('semver');
const exec = require('../../lib/util/exec');
const tag = require('../../lib/ops/tag');

jest.mock('../../lib/util/exec', () => jest.fn());

const { any } = expect;

beforeEach(() => {
  exec.mockImplementation(async (file, args) => {
    const command = [file, ...args].join(' ');

    if (command.startsWith('git commit')) {
      return '[master d3f884f] message';
    }

    return '';
  });
});

afterEach(() => {
  exec.mockReset();
});

describe('Tag should be an async operation', () => {
  test('getting as input a version arg', async () => {
    expect.assertions(1);

    await expect(tag('v1.0.0')).resolves.toBeDefined();
  });

  test('where version arg should always be given and be a valid semver number', async () => {
    expect.assertions(9);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag()).rejects.toThrow(reason);

    await expect(tag('123')).rejects.toThrow(reason);
    await expect(tag('1.3')).rejects.toThrow(reason);
    await expect(tag('1.alpha.3')).rejects.toThrow(reason);
    await expect(tag('alpha')).rejects.toThrow(reason);
    await expect(tag('')).rejects.toThrow(reason);
    await expect(tag(null)).rejects.toThrow(reason);
    await expect(tag(123)).rejects.toThrow(reason);

    expect(exec).not.toBeCalled();
  });

  test('getting an optional message arg', async () => {
    expect.assertions(1);

    await expect(tag('v1.0.0', 'Bump to v1.0.0')).resolves.toBeDefined();
  });

  test('resolving always to an { name, hash } object', async () => {
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

  test.each([
    'CHANGELOG.md', 'package-lock.json', 'npm-shrinkwrap.json'
  ])('even if the %s file is missing and so failed to be staged', async (filepath) => {
    expect.assertions(8);

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command === `git add ${filepath}`) {
        throw new Error(`Failed to stage file: ${filepath}`);
      } else if (command.startsWith('git commit')) {
        return '[master d3f884f] message';
      }

      return '';
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

  test('with template message using interpolation via %s placeholders', async () => {
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
  test('with tag name equal to the given version arg in the v1.0.0 form', async () => {
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

  test('with a template message using interpolation via %s placeholders', async () => {
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

describe('Tag should reject with an error', () => {
  test('when git add package.json throws a fatal exec error', async () => {
    expect.assertions(6);

    const reason = 'A fatal error occurred executing: git add package.json';

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command === 'git add package.json') {
        throw new Error(reason);
      }
    });

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).not.toBeCalledWith('git', ['add', 'CHANGELOG.md']);
    expect(exec).not.toBeCalledWith('git', ['add', 'package-lock.json']);
    expect(exec).not.toBeCalledWith('git', ['add', 'npm-shrinkwrap.json']);
    expect(exec).not.toBeCalledWith('git', ['commit', '-m', any(String)]);
    expect(exec).not.toBeCalledWith('git', ['tag', '-a', any(String), '-m', any(String)]);
  });

  test('when git commit throws a fatal exec error', async () => {
    expect.assertions(2);

    const reason = 'A fatal error occurred executing: git commit';

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command.startsWith('git commit')) {
        throw new Error(reason);
      }
    });

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).not.toBeCalledWith('git', ['tag', '-a', any(String), '-m', any(String)]);
  });

  test('when git tag throws a fatal exec error', async () => {
    expect.assertions(1);

    const reason = 'A fatal error occurred executing: git tag';

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command.startsWith('git commit')) {
        return '[master d3f884f] message';
      } else if (command.startsWith('git tag')) {
        throw new Error(reason);
      }

      return '';
    });

    await expect(tag('1.0.0')).rejects.toThrow(reason);
  });
});