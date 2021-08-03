'use strict';

const exec = require('../../lib/util/exec');
const logger = require('../../lib/util/logger');
const range = require('../../lib/ops/range');

jest.mock('../../lib/util/exec');

jest.mock('../../lib/util/logger', () => ({
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn()
}));

const { any } = expect;

beforeEach(() => {
  exec.mockResolvedValue('v1.0.0\n1.1.0');
})

afterEach(() => {
  exec.mockReset();

  logger.info.mockReset();
  logger.success.mockReset();
  logger.error.mockReset();

  delete global.verbose;
});

describe('Range should be an async operation', () => {
  test('getting as input an optional isPrerelease arg', async () => {
    expect.assertions(3);

    await expect(range()).resolves.toBeDefined();
    await expect(range(false)).resolves.toBeDefined();
    await expect(range(true)).resolves.toBeDefined();
  });

  test('where the isPrerelease arg should be a boolean value', async () => {
    expect.assertions(2);

    const reason = 'Invalid non boolean isPrerelease argument';

    await expect(range(123)).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });

  test('resolving to an object with schema `{ from, to }`', async () => {
    expect.assertions(1);

    await expect(range()).resolves.toMatchObject({
      from: any(String),
      to: 'HEAD'
    });
  });

  test('have spawn the `git tag` process once', async () => {
    expect.assertions(3);

    await expect(range()).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['tag']);
  });
});

describe('Range called for a stable release should resolve to', () => {
  test('a HEAD bounded range object in case no tags found in the repository', async () => {
    expect.assertions(1);

    exec.mockResolvedValue('');

    await expect(range()).resolves.toEqual({ from: null, to: 'HEAD' });
  });

  test('a range with `from` to the last stable tag ignoring any intermediate prereleased tags', async () => {
    expect.assertions(4);

    let tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0', 'v1.2.0-rc.0'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1', 'v1.2.0-rc.2'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });

  test('a valid range object even though tags are given in a not sorted semver order', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });

  test('a valid range object filtering out any tags given as not semver compatible name', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'exp-0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1', 'stable'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });

  test('a HEAD bounded range when no stable tag has been found', async () => {
    expect.assertions(1);

    let tags = ['exp-0', 'exp-1', 'v1.0.0-rc.0', 'v1.0.0-rc.1', 'v1.0.0-rc.2'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: null, to: 'HEAD' });
  });
});

describe('Range called for a prerelease release should resolve to', () => {
  test('a HEAD bounded range object in case no tags found in the repository', async () => {
    expect.assertions(1);

    exec.mockResolvedValue('');

    await expect(range(true)).resolves.toEqual({ from: null, to: 'HEAD' });
  });

  test('a range with `from` to the last tag either a stable or a prereleased tag', async () => {
    expect.assertions(4);

    let tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range(true)).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0', 'v1.2.0-rc.0'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-rc.0', to: 'HEAD' });

    tags = ['v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1', 'v1.2.0-rc.2'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-rc.2', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-rc.1', to: 'HEAD' });
  });

  test('a valid range object even though tags are given in a not sorted semver order', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range(true)).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });

  test('a valid range object filtering out any tags given as not semver compatible name', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'exp-0', 'v1.2.0-alpha.0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1', 'stable'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-alpha.0', to: 'HEAD' });
  });
});

describe('Range should report to console via logger', () => {
  test('when the verbose property has been enabled globally', async () => {
    expect.assertions(4);

    let tags = ['v1.0.0', 'v1.1.0'];
    exec.mockResolvedValue(tags.join('\n'));

    global.verbose = true;

    await expect(range()).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(2);

    expect(logger.info).nthCalledWith(1, 'The last tag found is v1.1.0', 1);
    expect(logger.info).nthCalledWith(2, "Git logs will be bounded to the range { from: 'v1.1.0', to: 'HEAD' }", 1);
  });

  test('when no last tag has been found', async () => {
    expect.assertions(4);

    let tags = ['exp-0', 'exp-1', 'v1.0.0-rc.0', 'v1.0.0-rc.1', 'v1.0.0-rc.2'];
    exec.mockResolvedValue(tags.join('\n'));

    global.verbose = true;

    await expect(range()).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(2);

    expect(logger.info).nthCalledWith(1, 'No last tag has been found', 1);
    expect(logger.info).nthCalledWith(2, "Git logs will be bounded to the range { from: null, to: 'HEAD' }", 1);
  });

  test('when no tags have been found', async () => {
    expect.assertions(4);

    exec.mockResolvedValue('');

    global.verbose = true;

    await expect(range()).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(2);

    expect(logger.info).nthCalledWith(1, 'No tags have been found', 1);
    expect(logger.info).nthCalledWith(2, "Git logs will be bounded to the range { from: null, to: 'HEAD' }", 1);
  });

  test('except when the verbose property is not set globally', async () => {
    expect.assertions(6);

    let tags = ['v1.0.0', 'v1.1.0'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toBeDefined();

    tags = ['exp-0', 'exp-1', 'v1.0.0-rc.0', 'v1.0.0-rc.1', 'v1.0.0-rc.2'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toBeDefined();

    exec.mockResolvedValue('');

    await expect(range()).resolves.toBeDefined();

    expect(logger.info).toBeCalledTimes(0);
    expect(logger.success).toBeCalledTimes(0);
    expect(logger.error).toBeCalledTimes(0);
  });
});

describe('Range should reject with an error', () => {
  test('when `git tag` process throws a fatal error', async () => {
    expect.assertions(3);

    const reason = 'A fatal error occurred executing: git tag';

    exec.mockRejectedValue(new Error(reason));

    await expect(range()).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['tag']);
  });
});