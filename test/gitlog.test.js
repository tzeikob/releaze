jest.mock('util');
jest.mock('child_process');

const { promisify } = require('util');
const { execFile } = require('child_process');

promisify.mockImplementation((fn) => fn);

const gitlog = require('../lib/gitlog.js');

afterEach(() => {
  execFile.mockReset();
});

describe('Error handling in gitlog({ from, to , format })', () => {
  test('should reject with Error when `from` arg is anything but a non empty string', async () => {
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

  test('should reject with Error when `to` arg is anything but a non empty string', async () => {
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

  test('should reject with Error when `format` arg is anything but a non empty string', async () => {
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

  test('should reject with Error when `git log` process returns stderr as Error', async () => {
    execFile.mockReturnValue(Promise.resolve({ stderr: new Error('A stderr occurred') }));

    expect.assertions(3);

    await expect(gitlog({})).rejects.toBeInstanceOf(Error);
    await expect(gitlog({})).rejects.toHaveProperty('message', 'Error: A stderr occurred');
    expect(execFile).toHaveBeenCalledTimes(2);
  });

  test('should reject with Error when `git log` process returns stderr as non Error', async () => {
    execFile.mockReturnValue(Promise.resolve({ stderr: 'A stderr occurred' }));

    expect.assertions(3);

    await expect(gitlog({})).rejects.toBeInstanceOf(Error);
    await expect(gitlog({})).rejects.toHaveProperty('message', 'A stderr occurred');
    expect(execFile).toHaveBeenCalledTimes(2);
  });

  test('should reject with Error when `git log` process throws a fatal error', async () => {
    execFile.mockReturnValue(Promise.reject(new Error('A fatal error occurred')));

    expect.assertions(3);

    await expect(gitlog({})).rejects.toBeInstanceOf(Error);
    await expect(gitlog({})).rejects.toHaveProperty('message', 'A fatal error occurred');
    expect(execFile).toHaveBeenCalledTimes(2);
  });
});