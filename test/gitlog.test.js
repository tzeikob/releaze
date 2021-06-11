jest.mock('util');
jest.mock('child_process');

const { promisify } = require('util');
const { execFile } = require('child_process');

promisify.mockImplementation((fn) => fn);

const gitlog = require('../lib/gitlog.js');

afterEach(() => {
  execFile.mockReset();
});

describe('Gitlog should reject with Error', () => {
  test('when `from` arg is anything but a non empty string', async () => {
    expect.assertions(11);

    await expect(gitlog({ from: 123 })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: NaN })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: Infinity })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: true })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: false })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: [] })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: {} })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: (() => {}) })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: Symbol('sym') })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ from: '' })).rejects.toBeInstanceOf(Error);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when `to` arg is anything but a non empty string', async () => {
    expect.assertions(11);

    await expect(gitlog({ to: 123 })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: NaN })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: Infinity })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: true })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: false })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: [] })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: {} })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: (() => {}) })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: Symbol('sym') })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ to: '' })).rejects.toBeInstanceOf(Error);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when `format` arg is anything but a non empty string', async () => {
    expect.assertions(11);

    await expect(gitlog({ format: 123 })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: NaN })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: Infinity })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: true })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: false })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: [] })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: {} })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: (() => {}) })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: Symbol('sym') })).rejects.toBeInstanceOf(Error);
    await expect(gitlog({ format: '' })).rejects.toBeInstanceOf(Error);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when git log process returns a stderr as Error', async () => {
    expect.assertions(3);

    execFile.mockReturnValue(Promise.resolve({ stderr: new Error('A stderr occurred') }));

    await expect(gitlog({})).rejects.toBeInstanceOf(Error);
    await expect(gitlog({})).rejects.toHaveProperty('message', 'Error: A stderr occurred');

    expect(execFile).toHaveBeenCalledTimes(2);
  });

  test('when git log process returns stderr as a non Error', async () => {
    expect.assertions(3);

    execFile.mockReturnValue(Promise.resolve({ stderr: 'A stderr occurred' }));

    await expect(gitlog({})).rejects.toBeInstanceOf(Error);
    await expect(gitlog({})).rejects.toHaveProperty('message', 'A stderr occurred');

    expect(execFile).toHaveBeenCalledTimes(2);
  });

  test('when git log process throws a fatal Error', async () => {
    expect.assertions(3);

    execFile.mockReturnValue(Promise.reject(new Error('A fatal error occurred')));

    await expect(gitlog({})).rejects.toBeInstanceOf(Error);
    await expect(gitlog({})).rejects.toHaveProperty('message', 'A fatal error occurred');

    expect(execFile).toHaveBeenCalledTimes(2);
  });
});

describe('Gitlog should spawn once a git log process in `--oneline` mode', () => {
  beforeEach(() => {
    execFile.mockReturnValue(Promise.resolve({ stdout: '' }));
  });

  test('with only `--format` set to default when no options argument is given', async () => {
    expect.assertions(2);

    await gitlog();

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('with only `--format` set to default when an empty options argument is given', async () => {
    expect.assertions(2);

    await gitlog({});

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('with only `--format` set to default when options argument is given with nullish properties', async () => {
    expect.assertions(2);

    await gitlog({ from: null, to: null, format: null });

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('with `--format` set to default when options is given with nullish `format`', async () => {
    expect.assertions(2);

    await gitlog({ format: null });

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('with `--format` set equal to the given `format` property in the options', async () => {
    expect.assertions(2);

    await gitlog({ format: '%s %an' });

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%s %an']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('with a revision range `from...to` set to the given `from` and `to` properties in the options', async () => {
    expect.assertions(2);

    await gitlog({ from: '871647f', to: '84e2fa8' });

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s', '871647f...84e2fa8']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('with a commit range `from...` set to the given `from` property in the options', async () => {
    expect.assertions(2);

    await gitlog({ from: '871647f' });

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s', '871647f...']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('with a commit range `to` set to the given `to` property in the options', async () => {
    expect.assertions(2);

    await gitlog({ to: '84e2fa8' });

    expect(execFile).toHaveBeenCalledWith('git', ['log', '--oneline', '--format=%h %s', '84e2fa8']);
    expect(execFile).toHaveBeenCalledTimes(1);
  });
});

describe('Gitlog should resolve to', () => {
  test('an array of strings when git log process returns a successful stdout', async () => {
    expect.assertions(2);

    execFile.mockReturnValue(Promise.resolve({ stdout: `line1\n` }));

    await expect(gitlog()).resolves.toEqual(['line1']);

    execFile.mockReturnValue(Promise.resolve({ stdout: `line1\nline2\nline3\n` }));

    await expect(gitlog()).resolves.toEqual(['line1', 'line2', 'line3']);
  });

  test('an empty array when git log process returns a successful but empty stdout', async () => {
    expect.assertions(2);

    execFile.mockReturnValue(Promise.resolve({ stdout: `\n` }));

    await expect(gitlog()).resolves.toEqual([]);

    execFile.mockReturnValue(Promise.resolve({ stdout: `` }));

    await expect(gitlog()).resolves.toEqual([]);
  });
});