const exec = require('../lib/util/exec');
const range = require('../lib/range');

jest.mock('../lib/util/exec', () => jest.fn().mockResolvedValue());

const { any } = expect;

afterEach(() => {
  exec.mockReset();
});

describe('Range should resolve', () => {
  test('getting as input an optional boolean arg named prerelease', async () => {
    expect.assertions(3);

    await expect(range()).resolves.toBeDefined();
    await expect(range(false)).resolves.toBeDefined();
    await expect(range(true)).resolves.toBeDefined();
  });

  test('having as resolved value an object with schema `{ from, to }`', async () => {
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
  test('an empty range object in case no tags found in the repository', async () => {
    expect.assertions(1);

    exec.mockResolvedValue('');

    await expect(range()).resolves.toEqual({ from: '', to: 'HEAD' });
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

  test('a valid range object filtering out any tags given a not semver compatible name', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'exp-0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1', 'stable'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });
});

describe('Range called for a prerelease release should resolve to', () => {
  test('an empty range object in case no tags found in the repository', async () => {
    expect.assertions(1);

    exec.mockResolvedValue('');

    await expect(range(true)).resolves.toEqual({ from: '', to: 'HEAD' });
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

  test('a valid range object filtering out any tags given a not semver compatible name', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'exp-0', 'v1.2.0-alpha.0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1', 'stable'];
    exec.mockResolvedValue(tags.join('\n'));

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-alpha.0', to: 'HEAD' });
  });
});

describe('Range should reject with an error', () => {
  test('early when called with prerelease given as a non boolean value', async () => {
    expect.assertions(2);

    const reason = 'Invalid non boolean prerelease argument';

    await expect(range(123)).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });

  test('when git tag process throws an error', async () => {
    expect.assertions(3);

    const reason = 'Failed to list tags: git tag';

    exec.mockRejectedValue(new Error(reason));

    await expect(range()).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['tag']);
  });
});