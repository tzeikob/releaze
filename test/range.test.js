jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation((fn) => fn)
}));

jest.mock('child_process', () => ({
  execFile: jest.fn().mockResolvedValue()
}));

const { execFile } = require('child_process');
const range = require('../lib/range');

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

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('very early when running within a no git repository', async () => {
    expect.assertions(3);

    const error = new Error('fatal: not a git repository (or any of the parent directories): .git');

    execFile.mockReturnValue(Promise.reject(error));

    await expect(range()).rejects.toThrow(error);

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['tag']);
  });

  test('when git tag process returns a stderr as Error', async () => {
    expect.assertions(3);

    const error = new Error('A stderr occurred');

    execFile.mockReturnValue(Promise.resolve({ stderr: error }));

    await expect(range()).rejects.toThrow(`Error: ${error.message}`);

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['tag']);
  });

  test('when git tag process returns a stderr as a non Error', async () => {
    expect.assertions(3);

    const reason = 'A stderr occurred';

    execFile.mockReturnValue(Promise.resolve({ stderr: reason }));

    await expect(range()).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['tag']);
  });

  test('when git tag process throws a fatal Error', async () => {
    expect.assertions(3);

    const error = new Error('A fatal error occurred');

    execFile.mockReturnValue(Promise.reject(error));

    await expect(range()).rejects.toThrow(error);

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['tag']);
  });
});

describe('Range should spawn once a `git tag` process', () => {
  test('with no further arguments', async () => {
    expect.assertions(3);
  
    execFile.mockReturnValue(Promise.resolve({ stdout: '' }));
  
    await expect(range()).resolves.toBeDefined();
  
    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['tag']);
  });
});

describe('Range called for stable should resolve to', () => {
  test('an empty object in case no tags found in the repository', async () => {
    expect.assertions(1);

    execFile.mockReturnValue(Promise.resolve({ stdout: '' }));

    await expect(range()).resolves.toEqual({});
  });

  test('an object with `from` to last stable tag if last tag is a prerelease', async () => {
    expect.assertions(1);

    const tags = ['v0.1.0', 'v0.1.1-alpha.0', 'v0.1.1-alpha.1', 'v1.0.0', 'v1.0.1-aplha.0', 'v1.0.1-aplha.1'];

    execFile.mockReturnValue(Promise.resolve({ stdout: tags.join('\n') }));

    await expect(range()).resolves.toEqual({ from: 'v1.0.0', to: 'HEAD' });
  });
});

describe('Range called for prerelease should resolve to', () => {
  test('an empty object in case no tags found in the repository', async () => {
    expect.assertions(1);

    execFile.mockReturnValue(Promise.resolve({ stdout: '' }));

    await expect(range(true)).resolves.toEqual({});
  });
});