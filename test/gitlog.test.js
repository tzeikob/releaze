const gitlog = require('../lib/gitlog');

describe('Call of lib/gitlog(from, to, format)', () => {
  test('should throw an error when `from` arg is given and is anything but a string', async () => {
    expect.assertions(9);

    await expect(gitlog(123)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(NaN)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(Infinity)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(true)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(false)).rejects.toBeInstanceOf(Error);
    await expect(gitlog([])).rejects.toBeInstanceOf(Error);
    await expect(gitlog({})).rejects.toBeInstanceOf(Error);
    await expect(gitlog(() => {})).rejects.toBeInstanceOf(Error);
    await expect(gitlog(Symbol('sym'))).rejects.toBeInstanceOf(Error);
  });

  test('should throw an error when `to` arg is given and is anything but a string', async () => {
    expect.assertions(9);

    await expect(gitlog(undefined, 123)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, NaN)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, Infinity)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, true)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, false)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, [])).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, {})).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, () => {})).rejects.toBeInstanceOf(Error);
    await expect(gitlog(undefined, Symbol('sym'))).rejects.toBeInstanceOf(Error);
  });

  test('should throw an error when both `from` and `to` args given and are anything but a string', async () => {
    expect.assertions(9);

    await expect(gitlog(123, 123)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(NaN, NaN)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(Infinity, Infinity)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(true, true)).rejects.toBeInstanceOf(Error);
    await expect(gitlog(false, false)).rejects.toBeInstanceOf(Error);
    await expect(gitlog([], [])).rejects.toBeInstanceOf(Error);
    await expect(gitlog({}, {})).rejects.toBeInstanceOf(Error);
    await expect(gitlog(() => {}, () => {})).rejects.toBeInstanceOf(Error);
    await expect(gitlog(Symbol('sym'), Symbol('sym'))).rejects.toBeInstanceOf(Error);
  });
});