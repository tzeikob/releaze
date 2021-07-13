const { execFile } = require('child_process');
const range = require('../lib/range');

jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation((fn) => fn)
}));

jest.mock('child_process', () => ({
  execFile: jest.fn().mockResolvedValue()
}));

afterEach(() => {
  execFile.mockReset();
});

describe('Range should reject with error', () => {
  test('very early when called with `prerelease` given as a non boolean value', async () => {
    expect.assertions(8);

    const reason = 'Invalid non boolean prerelease argument';

    await expect(range(123)).rejects.toThrow(reason);
    await expect(range('')).rejects.toThrow(reason);
    await expect(range('prerelease')).rejects.toThrow(reason);
    await expect(range([])).rejects.toThrow(reason);
    await expect(range({})).rejects.toThrow(reason);
    await expect(range(Symbol('s'))).rejects.toThrow(reason);
    await expect(range(() => {})).rejects.toThrow(reason);

    expect(execFile).toBeCalledTimes(0);
  });

  test('very early when running within a no git repository', async () => {
    expect.assertions(3);

    const error = new Error('fatal: not a git repository (or any of the parent directories): .git');

    execFile.mockRejectedValue(error);

    await expect(range()).rejects.toThrow(error);

    expect(execFile).toBeCalledTimes(1);
    expect(execFile).toBeCalledWith('git', ['tag']);
  });

  test('when git tag process returns a stderr as Error', async () => {
    expect.assertions(3);

    const error = new Error('A stderr occurred');

    execFile.mockResolvedValue({ stderr: error });

    await expect(range()).rejects.toThrow(`Error: ${error.message}`);

    expect(execFile).toBeCalledTimes(1);
    expect(execFile).toBeCalledWith('git', ['tag']);
  });

  test('when git tag process returns a stderr as a non Error', async () => {
    expect.assertions(3);

    const reason = 'A stderr occurred';

    execFile.mockResolvedValue({ stderr: reason });

    await expect(range()).rejects.toThrow(reason);

    expect(execFile).toBeCalledTimes(1);
    expect(execFile).toBeCalledWith('git', ['tag']);
  });

  test('when git tag process throws a fatal Error', async () => {
    expect.assertions(3);

    const error = new Error('A fatal error occurred');

    execFile.mockRejectedValue(error);

    await expect(range()).rejects.toThrow(error);

    expect(execFile).toBeCalledTimes(1);
    expect(execFile).toBeCalledWith('git', ['tag']);
  });
});

describe('Range should spawn once a `git tag` process', () => {
  test('with no further arguments', async () => {
    expect.assertions(3);
  
    execFile.mockResolvedValue({ stdout: '' });
  
    await expect(range()).resolves.toBeDefined();
  
    expect(execFile).toBeCalledTimes(1);
    expect(execFile).toBeCalledWith('git', ['tag']);
  });
});

describe('Range called for a stable release should resolve to', () => {
  test('an empty range object in case no tags found in the repository', async () => {
    expect.assertions(1);

    execFile.mockResolvedValue({ stdout: '' });

    await expect(range()).resolves.toEqual({});
  });

  test('a range with `from` to the last stable tag ignoring any intermediate prereleased tags', async () => {
    expect.assertions(4);

    let tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0', 'v1.2.0-rc.0'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1', 'v1.2.0-rc.2'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });

  test('a valid range object even though tags are given in a not sorted semver order', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });

  test('a valid range object filtering out any tags given a not semver compatible name', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'exp-0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1', 'stable'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range()).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });
});

describe('Range called for a prerelease release should resolve to', () => {
  test('an empty range object in case no tags found in the repository', async () => {
    expect.assertions(1);

    execFile.mockResolvedValue({ stdout: '' });

    await expect(range(true)).resolves.toEqual({});
  });

  test('a range with `from` to the last tag either a stable or a prereleased tag', async () => {
    expect.assertions(4);

    let tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range(true)).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0-rc.1', 'v1.1.0', 'v1.2.0-rc.0'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-rc.0', to: 'HEAD' });

    tags = ['v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1', 'v1.2.0-rc.2'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-rc.2', to: 'HEAD' });

    tags = ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0', 'v1.2.0-rc.0', 'v1.2.0-rc.1'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-rc.1', to: 'HEAD' });
  });

  test('a valid range object even though tags are given in a not sorted semver order', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range(true)).resolves.toEqual({ from: 'v1.1.0', to: 'HEAD' });
  });

  test('a valid range object filtering out any tags given a not semver compatible name', async () => {
    expect.assertions(1);

    let tags = ['v1.1.0', 'exp-0', 'v1.2.0-alpha.0', 'v1.1.0-rc.0', 'v1.0.0', 'v1.1.0-rc.1', 'stable'];
    execFile.mockResolvedValue({ stdout: tags.join('\n') });

    await expect(range(true)).resolves.toEqual({ from: 'v1.2.0-alpha.0', to: 'HEAD' });
  });
});