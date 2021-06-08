const gitlog = require('../lib/gitlog');

describe('Error handling in gitlog({ from, to , format })', () => {
  test('should reject with Error when `from` arg is anything but a non empty string', async () => {
    expect.assertions(10);

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
  });

  test('should reject with Error when `to` arg is anything but a non empty string', async () => {
    expect.assertions(10);

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
  });

  test('should reject with Error when `format` arg is anything but a non empty string', async () => {
    expect.assertions(10);

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
  });
});