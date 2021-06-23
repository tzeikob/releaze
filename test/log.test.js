jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation((fn) => fn)
}));

jest.mock('child_process', () => ({
  execFile: jest.fn().mockResolvedValue()
}));

const { execFile } = require('child_process');
const log = require('../lib/log.js');

afterEach(() => {
  execFile.mockReset();
});

describe('Log should reject with Error', () => {
  test('when `from` arg is anything but a non empty string', async () => {
    expect.assertions(11);

    const reason = 'Invalid from range argument';

    await expect(log({ from: 123 })).rejects.toThrow(reason);
    await expect(log({ from: NaN })).rejects.toThrow(reason);
    await expect(log({ from: Infinity })).rejects.toThrow(reason);
    await expect(log({ from: true })).rejects.toThrow(reason);
    await expect(log({ from: false })).rejects.toThrow(reason);
    await expect(log({ from: [] })).rejects.toThrow(reason);
    await expect(log({ from: {} })).rejects.toThrow(reason);
    await expect(log({ from: (() => {}) })).rejects.toThrow(reason);
    await expect(log({ from: Symbol('sym') })).rejects.toThrow(reason);
    await expect(log({ from: '' })).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when `from` is a not valid git commit hash (sha1) or semver tag name', async () => {
    expect.assertions(7);

    const reason = 'Invalid from range argument';

    await expect(log({ from: 'c26GGG' })).rejects.toThrow(reason);
    await expect(log({ from: 'c262349^' })).rejects.toThrow(reason);
    await expect(log({ from: '^c262349' })).rejects.toThrow(reason);
    await expect(log({ from: '01.33.a4' })).rejects.toThrow(reason);
    await expect(log({ from: '..' })).rejects.toThrow(reason);
    await expect(log({ from: '...' })).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when `to` arg is anything but a non empty string', async () => {
    expect.assertions(11);

    const reason = 'Invalid to range argument';

    await expect(log({ to: 123 })).rejects.toThrow(reason);
    await expect(log({ to: NaN })).rejects.toThrow(reason);
    await expect(log({ to: Infinity })).rejects.toThrow(reason);
    await expect(log({ to: true })).rejects.toThrow(reason);
    await expect(log({ to: false })).rejects.toThrow(reason);
    await expect(log({ to: [] })).rejects.toThrow(reason);
    await expect(log({ to: {} })).rejects.toThrow(reason);
    await expect(log({ to: (() => {}) })).rejects.toThrow(reason);
    await expect(log({ to: Symbol('sym') })).rejects.toThrow(reason);
    await expect(log({ to: '' })).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when `to` is a not valid git commit hash (sha1) or semver tag name', async () => {
    expect.assertions(7);

    const reason = 'Invalid to range argument';

    await expect(log({ to: 'c26GGG' })).rejects.toThrow(reason);
    await expect(log({ to: 'c262349^' })).rejects.toThrow(reason);
    await expect(log({ to: '^c262349' })).rejects.toThrow(reason);
    await expect(log({ to: '01.33.a4' })).rejects.toThrow(reason);
    await expect(log({ to: '..' })).rejects.toThrow(reason);
    await expect(log({ to: '...' })).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when `format` arg is anything but a non empty string', async () => {
    expect.assertions(11);

    const reason = 'Invalid format argument';

    await expect(log({ format: 123 })).rejects.toThrow(reason);
    await expect(log({ format: NaN })).rejects.toThrow(reason);
    await expect(log({ format: Infinity })).rejects.toThrow(reason);
    await expect(log({ format: true })).rejects.toThrow(reason);
    await expect(log({ format: false })).rejects.toThrow(reason);
    await expect(log({ format: [] })).rejects.toThrow(reason);
    await expect(log({ format: {} })).rejects.toThrow(reason);
    await expect(log({ format: (() => {}) })).rejects.toThrow(reason);
    await expect(log({ format: Symbol('sym') })).rejects.toThrow(reason);
    await expect(log({ format: '' })).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when git log process returns a stderr as Error', async () => {
    expect.assertions(2);

    const error = new Error('A stderr occurred');

    execFile.mockReturnValue(Promise.resolve({ stderr: error }));

    await expect(log({})).rejects.toThrow(`Error: ${error.message}`);

    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('when git log process returns stderr as a non Error', async () => {
    expect.assertions(2);

    const reason = 'A stderr occurred';

    execFile.mockReturnValue(Promise.resolve({ stderr: reason }));

    await expect(log({})).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('when git log process throws a fatal Error', async () => {
    expect.assertions(2);

    const error = new Error('A fatal error occurred');

    execFile.mockReturnValue(Promise.reject(error));

    await expect(log({})).rejects.toThrow(error);

    expect(execFile).toHaveBeenCalledTimes(1);
  });
});

describe('Log should spawn once a git log process in `--oneline` mode', () => {
  beforeEach(() => {
    execFile.mockReturnValue(Promise.resolve({ stdout: '' }));
  });

  test('with only `--format` set to default when no options argument is given', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
  });

  test('with only `--format` set to default when an empty options argument is given', async () => {
    expect.assertions(3);

    await expect(log({})).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
  });

  test('with only `--format` set to default when options argument is given with nullish properties', async () => {
    expect.assertions(3);

    await expect(log({ from: null, to: null, format: null })).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
  });

  test('with `--format` set to default when options is given with nullish `format`', async () => {
    expect.assertions(3);

    await expect(log({ format: null })).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
  });

  test('with `--format` set equal to the given `format` property in the options', async () => {
    expect.assertions(3);

    await expect(log({ format: '%s %an' })).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%s %an']);
  });

  test('with a range notation `from..to` set to the given `from` and `to` properties in the options', async () => {
    expect.assertions(3);

    await expect(log({ from: '871647f', to: '84e2fa8' })).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s', '871647f..84e2fa8']);
  });

  test('with a range notation `from..` set to the given `from` property in the options', async () => {
    expect.assertions(3);

    await expect(log({ from: '871647f' })).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s', '871647f..']);
  });

  test('with a range notation `to` set to the given `to` property in the options', async () => {
    expect.assertions(3);

    await expect(log({ to: '84e2fa8' })).resolves.toBeDefined();

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s', '84e2fa8']);
  });
});

describe('Log should resolve to', () => {
  test('an array of strings when git log process returns a successful stdout', async () => {
    expect.assertions(2);

    execFile.mockReturnValue(Promise.resolve({ stdout: `line1\n` }));

    await expect(log()).resolves.toEqual(['line1']);

    execFile.mockReturnValue(Promise.resolve({ stdout: `line1\nline2\nline3\n` }));

    await expect(log()).resolves.toEqual(['line1', 'line2', 'line3']);
  });

  test('an empty array when git log process returns a successful but empty stdout', async () => {
    expect.assertions(2);

    execFile.mockReturnValue(Promise.resolve({ stdout: `\n` }));

    await expect(log()).resolves.toEqual([]);

    execFile.mockReturnValue(Promise.resolve({ stdout: '' }));

    await expect(log()).resolves.toEqual([]);
  });
});