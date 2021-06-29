jest.mock('fs', () => ({
  promises: {
    access: jest.fn().mockResolvedValue()
  }
}));

jest.mock('../lib/util/exec', () => jest.fn().mockResolvedValue());

const fs = require('fs');
const path = require('path');
const { when } = require('jest-when');
const exec = require('../lib/util/exec');
const tag = require('../lib/tag.js');

const { access } = fs.promises;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');
const pathToChangelogMD = path.join(process.cwd(), 'CHANGELOG.md');
const pathToPackageLockJSON = path.join(process.cwd(), 'package-lock.json');
const pathToShrinkwrapJSON = path.join(process.cwd(), 'npm-shrinkwrap.json');

afterEach(() => {
  access.mockReset();
  exec.mockReset();
});

describe('Tag should reject with an error', () => {
  test('early when called with no `version` argument', async () => {
    expect.assertions(2);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag()).rejects.toThrow(reason);

    expect(exec).toHaveBeenCalledTimes(0);
  });

  test('early when called with invalid `version` argument', async () => {
    expect.assertions(13);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag('123')).rejects.toThrow(reason);
    await expect(tag('1.alpha.3')).rejects.toThrow(reason);
    await expect(tag('head')).rejects.toThrow(reason);
    await expect(tag('HEAD')).rejects.toThrow(reason);

    await expect(tag(123)).rejects.toThrow(reason);
    await expect(tag(NaN)).rejects.toThrow(reason);
    await expect(tag(Infinity)).rejects.toThrow(reason);
    await expect(tag(true)).rejects.toThrow(reason);

    await expect(tag([])).rejects.toThrow(reason);
    await expect(tag({})).rejects.toThrow(reason);
    await expect(tag(Symbol('s'))).rejects.toThrow(reason);
    await expect(tag(() => {})).rejects.toThrow(reason);

    expect(exec).toHaveBeenCalledTimes(0);
  });

  test('early when called with invalid template `message` argument', async () => {
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

    expect(exec).toHaveBeenCalledTimes(0);
  });

  test('immediately when `exec` with `git add package.json` throws a fatal error', async () => {
    expect.assertions(3);

    const reason = 'A fatal error occurred';

    when(exec).calledWith('git', ['add', pathToPackageJSON]).mockRejectedValue(new Error(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
  });

  test('immediately when `exec` with `git add CHANGELOG.md` throws a fatal error', async () => {
    expect.assertions(4);

    when(exec).calledWith('git', ['add', pathToPackageJSON]).mockResolvedValue();

    when(access).calledWith(pathToChangelogMD).mockResolvedValue();

    const reason = 'A fatal error occurred';

    when(exec).calledWith('git', ['add', pathToChangelogMD]).mockRejectedValue(new Error(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToChangelogMD]);
  });

  test('immediately when `exec` with `git add package-lock.json` throws a fatal error', async () => {
    expect.assertions(4);

    when(exec).calledWith('git', ['add', pathToPackageJSON]).mockResolvedValue();

    when(access).calledWith(pathToChangelogMD).mockRejectedValue(new Error('File not found'));
    when(access).calledWith(pathToPackageLockJSON).mockResolvedValue();

    const reason = 'A fatal error occurred';

    when(exec).calledWith('git', ['add', pathToPackageLockJSON]).mockRejectedValue(new Error(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToPackageLockJSON]);
  });

  test('immediately when `exec` with `git add npm-shrinkwrap.json` throws a fatal error', async () => {
    expect.assertions(4);

    when(exec).calledWith('git', ['add', pathToPackageJSON]).mockResolvedValue();

    when(access).calledWith(pathToChangelogMD).mockRejectedValue(new Error('File not found'));
    when(access).calledWith(pathToPackageLockJSON).mockRejectedValue(new Error('File not found'));
    when(access).calledWith(pathToShrinkwrapJSON).mockResolvedValue();

    const reason = 'A fatal error occurred';

    when(exec).calledWith('git', ['add', pathToShrinkwrapJSON]).mockRejectedValue(new Error(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToShrinkwrapJSON]);
  });
});

describe('Tag should not reject with error', () => {
  test('when there is no `CHANGELOG.md` file', async () => {
    expect.assertions(7);

    when(exec).calledWith('git', ['add', pathToPackageJSON]).mockResolvedValue({});

    const reason = `ENOENT: no such file or directory, access '${pathToChangelogMD}'`;
    when(access).calledWith(pathToChangelogMD).mockRejectedValue(new Error(reason));

    when(access).calledWith(pathToPackageLockJSON).mockResolvedValue();
    when(exec).calledWith('git', ['add', pathToPackageLockJSON]).mockResolvedValue({});

    when(access).calledWith(pathToShrinkwrapJSON).mockResolvedValue();
    when(exec).calledWith('git', ['add', pathToShrinkwrapJSON]).mockResolvedValue({});

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(access).toHaveBeenCalledTimes(3);
    expect(access).toHaveBeenNthCalledWith(1, pathToChangelogMD);

    expect(exec).toHaveBeenCalledTimes(3);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToPackageLockJSON]);
    expect(exec).toHaveBeenNthCalledWith(3, 'git', ['add', pathToShrinkwrapJSON]);
  });

  test('when there is no `package-lock.json` file', async () => {
    expect.assertions(7);

    when(exec).calledWith('git', ['add', pathToPackageJSON]).mockResolvedValue({});

    when(access).calledWith(pathToChangelogMD).mockResolvedValue();
    when(exec).calledWith('git', ['add', pathToChangelogMD]).mockResolvedValue({});

    const reason = `ENOENT: no such file or directory, access '${pathToPackageLockJSON}'`;
    when(access).calledWith(pathToPackageLockJSON).mockRejectedValue(new Error(reason));

    when(access).calledWith(pathToShrinkwrapJSON).mockResolvedValue();
    when(exec).calledWith('git', ['add', pathToShrinkwrapJSON]).mockResolvedValue({});

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(access).toHaveBeenCalledTimes(3);
    expect(access).toHaveBeenNthCalledWith(2, pathToPackageLockJSON);

    expect(exec).toHaveBeenCalledTimes(3);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToChangelogMD]);
    expect(exec).toHaveBeenNthCalledWith(3, 'git', ['add', pathToShrinkwrapJSON]);
  });

  test('when there is no `npm-shrinkwrap.json` file', async () => {
    expect.assertions(7);

    when(exec).calledWith('git', ['add', pathToPackageJSON]).mockResolvedValue({});

    when(access).calledWith(pathToChangelogMD).mockResolvedValue();
    when(exec).calledWith('git', ['add', pathToChangelogMD]).mockResolvedValue({});

    when(access).calledWith(pathToPackageLockJSON).mockResolvedValue();
    when(exec).calledWith('git', ['add', pathToPackageLockJSON]).mockResolvedValue({});

    const reason = `ENOENT: no such file or directory, access '${pathToShrinkwrapJSON}'`;
    when(access).calledWith(pathToShrinkwrapJSON).mockRejectedValue(new Error(reason));

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(access).toHaveBeenCalledTimes(3);
    expect(access).toHaveBeenNthCalledWith(3, pathToShrinkwrapJSON);

    expect(exec).toHaveBeenCalledTimes(3);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToChangelogMD]);
    expect(exec).toHaveBeenNthCalledWith(3, 'git', ['add', pathToPackageLockJSON]);
  });
});