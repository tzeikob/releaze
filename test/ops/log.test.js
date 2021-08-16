'use strict';

const exec = require('../../lib/util/exec');
const log = require('../../lib/ops/log');

jest.mock('../../lib/util/exec');

beforeEach(() => {
  exec.mockResolvedValue('log1\nlog2\nlog3');
});

afterEach(() => {
  exec.mockReset();
});

describe('Log should be an async operation', () => {
  test('getting as input an optional range { from, to } object', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();
    await expect(log(null)).resolves.toBeDefined();
    await expect(log({ from: '84e2fa8', to: 'HEAD' })).resolves.toBeDefined();
  });

  test('where both from and to props could be null or undefined', async () => {
    expect.assertions(8);

    await expect(log({})).resolves.toBeDefined();
    await expect(log({ to: '84e2fa8' })).resolves.toBeDefined();
    await expect(log({ from: '84e2fa8' })).resolves.toBeDefined();

    await expect(log({ from: null, to: null })).resolves.toBeDefined();
    await expect(log({ from: null })).resolves.toBeDefined();
    await expect(log({ to: null })).resolves.toBeDefined();
    await expect(log({ from: null, to: '84e2fa8' })).resolves.toBeDefined();
    await expect(log({ from: '84e2fa8', to: null })).resolves.toBeDefined();
  });

  test('where both from and to props should be a valid git ref either hash, semver tag or HEAD', async () => {
    expect.assertions(9);

    const reason = 'Invalid git range argument';

    await expect(log({ from: 'c26GGG' })).rejects.toThrow(reason);
    await expect(log({ from: 'v1.33.a4' })).rejects.toThrow(reason);
    await expect(log({ from: 'head' })).rejects.toThrow(reason);
    await expect(log({ from: '' })).rejects.toThrow(reason);

    await expect(log({ to: 'c26GGG' })).rejects.toThrow(reason);
    await expect(log({ to: 'v1.33.a4' })).rejects.toThrow(reason);
    await expect(log({ to: 'head' })).rejects.toThrow(reason);
    await expect(log({ to: '' })).rejects.toThrow(reason);

    expect(exec).not.toBeCalled();
  });

  test('getting as input another optional format argument', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();
    await expect(log(null, null)).resolves.toBeDefined();
    await expect(log(null, '%h $s')).resolves.toBeDefined();
  });
});

describe('Log should resolve', () => {
  test('always to an array', async () => {
    expect.assertions(1);

    await expect(log()).resolves.toBeInstanceOf(Array);
  });

  test('to an array of git log strings', async () => {
    expect.assertions(2);

    exec.mockResolvedValue('line1\n');

    await expect(log()).resolves.toEqual(['line1']);

    exec.mockResolvedValue('line1\nline2\nline3\n');

    await expect(log()).resolves.toEqual(['line1', 'line2', 'line3']);
  });

  test('to an empty array when git log process returns no logs', async () => {
    expect.assertions(2);

    exec.mockResolvedValue('\n');

    await expect(log()).resolves.toEqual([]);

    exec.mockResolvedValue('');

    await expect(log()).resolves.toEqual([]);
  });
});

describe('Log should spawn the git log process once and given the range', () => {
  test.each([
    [{ from: '871647f', to: '84e2fa8' }, '871647f..84e2fa8'],
    [{ from: '871647f', to: null }, '871647f..HEAD'],
    [{ from: null, to: '84e2fa8' }, '84e2fa8'],
    [{ from: '84e2fa8', to: 'HEAD' }, '84e2fa8..HEAD'],
    [{ from: null, to: 'HEAD' }, 'HEAD'],
    [{ from: 'HEAD', to: 'HEAD' }, 'HEAD..HEAD'],
    [{ from: '1.0.0', to: '2.0.0' }, '1.0.0..2.0.0'],
    [{ from: '1.0.0', to: null }, '1.0.0..HEAD'],
    [{ from: null, to: '2.0.0' }, '2.0.0'],
    [{ from: 'v1.0.0', to: 'v2.0.0' }, 'v1.0.0..v2.0.0']
  ])('%o must use the %p range notation', async (range, notation) => {
    expect.assertions(3);

    await expect(log(range)).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', notation]);
  });

  test.each([
    null, {}, { from: null, to: null }
  ])('%s must not use a range notation', async (range) => {
    expect.assertions(3);

    await expect(log(range)).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s']);
  });

  test('undefined must not use a range notation', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s']);
  });
});

describe('Log should spawn the git log process once with a format template', () => {
  test('equal to the default format "%h %s" if format arg is not given', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s']);
  });

  test('equal to the given format arg', async () => {
    expect.assertions(3);

    const format = '%h %s';

    await expect(log(null, format)).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', `--format=${format}`]);
  });
});

describe('Log should reject with error', () => {
  test('when git log process throws a fatal error', async () => {
    expect.assertions(2);

    const reason = 'A fatal error occurred executing: git log';

    exec.mockRejectedValue(new Error(reason));

    await expect(log()).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(1);
  });
});