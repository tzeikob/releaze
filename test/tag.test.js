jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation((fn) => fn)
}));

jest.mock('child_process', () => ({
  execFile: jest.fn().mockResolvedValue()
}));

const { execFile } = require('child_process');
const tag = require('../lib/tag.js');

afterEach(() => {
  execFile.mockReset();
});

describe('Tag should reject with an error', () => {
  test('very early when called with no `version` argument', async () => {
    expect.assertions(2);

    const reason = 'Invalid or missing version argument';

    await expect(tag()).rejects.toThrown(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('very early when called with invalid `version` argument', async () => {
    expect.assertions(11);

    const reason = 'Invalid or missing version argument';

    await expect(tag('123')).rejects.toThrow(reason);
    await expect(tag('1.alpha.3')).rejects.toThrow(reason);

    await expect(tag(123)).rejects.toThrow(reason);
    await expect(tag(NaN)).rejects.toThrow(reason);
    await expect(tag(Infinity)).rejects.toThrow(reason);
    await expect(tag(true)).rejects.toThrow(reason);

    await expect(tag([])).rejects.toThrow(reason);
    await expect(tag({})).rejects.toThrow(reason);
    await expect(tag(Symbol('s'))).rejects.toThrow(reason);
    await expect(tag(() => {})).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('very early when called with invalid template `message` argument', async () => {
    expect.assertions(10);

    const reason = 'Invalid non string message argument';

    await expect(tag('1.0.0', '')).rejects.toThrow(reason);
    await expect(tag('1.0.0', 123)).rejects.toThrow(reason);
    await expect(tag('1.0.0', NaN)).rejects.toThrow(reason);
    await expect(tag('1.0.0', Infinity)).rejects.toThrow(reason);
    await expect(tag('1.0.0', true)).rejects.toThrow(reason);

    await expect(tag('1.0.0', [])).rejects.toThrow(reason);
    await expect(tag('1.0.0', {})).rejects.toThrow(reason);
    await expect(tag('1.0.0', Symbol('s'))).rejects.toThrow(reason);
    await expect(tag('1.0.0', () => {})).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when running within a no git repository', async () => {
    expect.assertions(3);

    const error = new Error('fatal: not a git repository (or any of the parent directories): .git');

    execFile.mockReturnValue(Promise.reject(error));

    await expect(tag('1.0.0')).rejects.toThrow(error);

    expect(execFile).toHaveBeenCalledTimes(1);
    expect(execFile).toHaveBeenCalledWith('git', ['add', 'package.json']);
  });
  
  test('when trying to create a tag which already exists', async () => {
    expect.assertions(2);

    const error = new Error("fatal: tag 'v2.0.0' already exists");

    execFile.mockReturnValue(Promise.reject(error));

    await expect(tag('2.0.0')).rejects.toThrow(error);

    expect(execFile).toHaveBeenCalledWith('git', ['tag', '-a', 'v2.0.0', '-m', 'Bump to v2.0.0']);
  });
});

describe('Tag called with valid input should try to stage', () => {
  test('the `package.json` file exists or not', async () => {
    expect.assertions(2);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['add', 'package.json']);
  });

  test('the `package-lock.json` file exists or not', async () => {
    expect.assertions(2);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['add', 'package-lock.json']);
  });

  test('the `npm-shrinkwrap.json` file exists or not', async () => {
    expect.assertions(2);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['add', 'npm-shrinkwrap.json']);
  });

  test('the `CHANGELOG.md` file exists or not', async () => {
    expect.assertions(2);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['add', 'CHANGELOG.md']);
  });
});

describe('Tag called with valid input should try to', () => {
  test('commit with the default message if no `message` argument is given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['commit', '-m', `Bump to v${version}`]);
  });

  test('commit with interpolated message equal to the given template `message` argument', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new version v%s';
    const interpolated = message.replace('/%s/g', version);

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['commit', '-m', interpolated]);
  });

  test('create an anno tag with name `v{version}` and the default message', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['tag', '-a', `v${version}`, '-m', `Bump to v${version}`]);
  });

  test('create an anno tag with name `v{version}` and %s interpolated message', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new version v%s';
    const interpolated = message.replace(/%s/g, version);

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledWith('git', ['tag', '-a', `v${version}`, '-m', interpolated]);
  });

  test('stage changes then commit them and finally create a new tag on it', async () => {
    expect.assertions(8);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(execFile).toHaveBeenCalledTimes(6);
    expect(execFile).toHaveBeenCalledWith('git', ['add', 'package.json']);
    expect(execFile).toHaveBeenCalledWith('git', ['add', 'package-lock.json']);
    expect(execFile).toHaveBeenCalledWith('git', ['add', 'npm-shrinkwrap.json']);
    expect(execFile).toHaveBeenCalledWith('git', ['add', 'CHANGELOG.md']);
    expect(execFile).toHaveBeenCalledWith('git', ['commit', '-m', `Bump to v${version}`]);
    expect(execFile).toHaveBeenCalledWith('git', ['tag', '-a', `v${version}`, '-m', `Bump to v${version}`]);
  });
});