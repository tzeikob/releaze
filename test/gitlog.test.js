const gitlog = require('../lib/gitlog');

describe('Call of lib/gitlog({ from, to , format })', () => {
  test('should throw an error when `from` arg is given and is anything but a non empty string', async () => {
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

  test('should throw an error when `to` arg is given and is anything but a non empty string', async () => {
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

  test('should throw an error when `format` arg is given and is anything but a non empty string', async () => {
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