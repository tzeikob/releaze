jest.mock('fs', () => ({
  promises: {
    access: jest.fn().mockResolvedValue()
  }
}));

jest.mock('../lib/util/exec', () => jest.fn().mockResolvedValue());

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const exec = require('../lib/util/exec');
const ExecError = require('../lib/errors/exec-error');
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

describe('Tag called with invalid input should reject early with error', () => {
  test('when `version` argument is not given', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag()).rejects.toThrow(reason);

    expect(access).toHaveBeenCalledTimes(0);
    expect(exec).toHaveBeenCalledTimes(0);
  });

  test('when invalid non semver `version` argument is given', async () => {
    expect.assertions(14);

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

    expect(access).toHaveBeenCalledTimes(0);
    expect(exec).toHaveBeenCalledTimes(0);
  });

  test('when invalid non string template `message` argument is given', async () => {
    expect.assertions(11);

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

    expect(access).toHaveBeenCalledTimes(0);
    expect(exec).toHaveBeenCalledTimes(0);
  });
});

describe('Tag should try to stage files in the git repo and reject with an error', () => {
  test('when `exec` for `git add package.json` throws a fatal exec error', async () => {
    expect.assertions(4);

    const reason = 'An error occurred executing `git add package.json`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toHaveBeenCalledTimes(0);

    expect(exec).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledWith('git', ['add', pathToPackageJSON]);
  });

  test('when `exec` for `git add CHANGELOG.md` throws a fatal exec error', async () => {
    expect.assertions(6);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockResolvedValueOnce('CHANGELOG.md exists');

    const reason = 'An error occurred executing `git add CHANGELOG.md`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenCalledWith(pathToChangelogMD);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToChangelogMD]);
  });

  test('when `exec` for `git add package-lock.json` throws a fatal exec error', async () => {
    expect.assertions(7);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockRejectedValueOnce(new Error('CHANGELOG.md file not found'));

    access.mockResolvedValueOnce('package-lock.json exists');

    const reason = 'An error occurred executing `git add package-lock.js`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toHaveBeenCalledTimes(2);
    expect(access).toHaveBeenNthCalledWith(1, pathToChangelogMD);
    expect(access).toHaveBeenNthCalledWith(2, pathToPackageLockJSON);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToPackageLockJSON]);
  });

  test('when `exec` for `git add npm-shrinkwrap.json` throws a fatal exec error', async () => {
    expect.assertions(8);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockRejectedValueOnce(new Error('CHANGELOG.md file not found'));
    access.mockRejectedValueOnce(new Error('package-lock.json file not found'));

    access.mockResolvedValueOnce('npm-shrinkwrap.json exists');

    const reason = 'An error occurred executing `git add npm-shrinkwrap.json`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toHaveBeenCalledTimes(3);
    expect(access).toHaveBeenNthCalledWith(1, pathToChangelogMD);
    expect(access).toHaveBeenNthCalledWith(2, pathToPackageLockJSON);
    expect(access).toHaveBeenNthCalledWith(3, pathToShrinkwrapJSON);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToShrinkwrapJSON]);
  });
});

describe('Tag should not try to add a missing file in the git repo', () => {
  test('skipping `git add CHANGELOG.md` for missing `CHANGELOG.md` file', async () => {
    expect.assertions(2);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockRejectedValueOnce(new Error('CHANGELOG.md file not found'));

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).not.toHaveBeenCalledWith('git', ['add', pathToChangelogMD]);
  });

  test('skipping `git add package-lock.json` for missing `package-lock.json` file', async () => {
    expect.assertions(2);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockResolvedValueOnce('CHANGELOG.md exists');
    exec.mockResolvedValueOnce('CHANGELOG.md staged successfully');

    access.mockRejectedValueOnce(new Error('package-lock.json file not found'));

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).not.toHaveBeenCalledWith('git', ['add', pathToPackageLockJSON]);
  });

  test('skipping `git add npm-shrinkwrap.json` for missing `npm-shrinkwrap.json` file', async () => {
    expect.assertions(2);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockResolvedValueOnce('CHANGELOG.md exists');
    exec.mockResolvedValueOnce('CHANGELOG.md staged successfully');

    access.mockResolvedValueOnce('package-lock.json exists');
    exec.mockResolvedValueOnce('package-lock.json staged successfully');

    access.mockRejectedValueOnce(new Error('npm-shrinkwrap.json file not found'));

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).not.toHaveBeenCalledWith('git', ['add', pathToShrinkwrapJSON]);
  });
});

describe('Tag should try to commit the changes in the git repo', () => {
  test('with the default message if the `message` arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['commit', '-m', `Bump to v${version}`]);
  });

  test('with the message equal to the given `message` arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump new version to ${version}`;

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['commit', '-m', message]);
  });

  test('with a message interpolating the given `version` via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['commit', '-m', `Bump to new v${version}`]);
  });

  test('with `version` injected into the `message` via interpolation in clean semver form', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['commit', '-m', `Bump to new v${semver.clean(version)}`]);
  });

  test('right after any `git add` is executed', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toHaveBeenNthCalledWith(5, 'git', ['commit', '-m', expect.any(String)]);
  });

  test('rejecting with an error when `exec` for `git commit` throws a fatal exec error', async () => {
    expect.assertions(2);

    exec.mockResolvedValueOnce('package.json staged successfully');
    
    access.mockResolvedValueOnce('CHANGELOG.md exists');
    exec.mockResolvedValueOnce('CHANGELOG.md staged successfully');

    access.mockResolvedValueOnce('package-lock.json exists');
    exec.mockResolvedValueOnce('package-lock.json staged successfully');

    access.mockResolvedValueOnce('npm-shrinkwrap.json exists');
    exec.mockResolvedValueOnce('npm-shrinkwrap.json staged successfully');

    const reason = 'An error occurred executing git commit';
    exec.mockRejectedValueOnce(new ExecError(reason));

    const version = '1.0.0';

    await expect(tag(version)).rejects.toThrow(reason);

    expect(exec).toHaveBeenNthCalledWith(5, 'git', ['commit', '-m', expect.any(String)]);
  });
});

describe('Tag should try to create an anno tag in the git repo', () => {
  test('with tag name equal to the given `version` in `v1.0.0` form', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['tag', '-a', `v${version}`, '-m', expect.any(String)]);
  });

  test('with tag name equal to the given `version` in `v1.0.0` form even for not clean semver numbers', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['tag', '-a', `v${semver.clean(version)}`, '-m', expect.any(String)]);
  });

  test('with the default message if `message` arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump to v${version}`;

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['tag', '-a', expect.any(String), '-m', message]);
  });

  test('with the message equal to the given `message` arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump new version to ${version}`;

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['tag', '-a', expect.any(String), '-m', message]);
  });

  test('with a message interpolating the given `version` via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['tag', '-a', expect.any(String), '-m', `Bump to new v${version}`]);
  });

  test('with `version` injected into the `message` via interpolation in clean semver form', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledWith('git', ['tag', '-a', expect.any(String), '-m', `Bump to new v${semver.clean(version)}`]);
  });

  test('right after the `git commit` is executed', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toHaveBeenNthCalledWith(6, 'git', ['tag', '-a', expect.any(String), '-m', expect.any(String)]);
  });

  test('rejecting with an error when `exec` for `git tag` throws a fatal exec error', async () => {
    expect.assertions(2);

    exec.mockResolvedValueOnce('package.json staged successfully');
    
    access.mockResolvedValueOnce('CHANGELOG.md exists');
    exec.mockResolvedValueOnce('CHANGELOG.md staged successfully');

    access.mockResolvedValueOnce('package-lock.json exists');
    exec.mockResolvedValueOnce('package-lock.json staged successfully');

    access.mockResolvedValueOnce('npm-shrinkwrap.json exists');
    exec.mockResolvedValueOnce('npm-shrinkwrap.json staged successfully');

    exec.mockResolvedValueOnce('commit changes successfully');

    const reason = 'An error occurred executing git tag';
    exec.mockRejectedValueOnce(new ExecError(reason));

    const version = '1.0.0';

    await expect(tag(version)).rejects.toThrow(reason);

    expect(exec).toHaveBeenNthCalledWith(6, 'git', ['tag', '-a', expect.any(String), '-m', expect.any(String)]);
  });
});

describe('Tag should resolve to undefined', () => {
  test('accessing the files `CHANGELOG.md`, `package-lock.json` and `npm-shrinkwrap.json` once', async () => {
    expect.assertions(5);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(access).toHaveBeenCalledTimes(3);
    expect(access).toHaveBeenCalledWith(pathToChangelogMD);
    expect(access).toHaveBeenCalledWith(pathToPackageLockJSON);
    expect(access).toHaveBeenCalledWith(pathToShrinkwrapJSON);
  });

  test('having git add, commit and tag commands executed in the that given order', async () => {
    expect.assertions(8);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).toHaveBeenCalledTimes(6);
    expect(exec).toHaveBeenNthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).toHaveBeenNthCalledWith(2, 'git', ['add', pathToChangelogMD]);
    expect(exec).toHaveBeenNthCalledWith(3, 'git', ['add', pathToPackageLockJSON]);
    expect(exec).toHaveBeenNthCalledWith(4, 'git', ['add', pathToShrinkwrapJSON]);
    expect(exec).toHaveBeenNthCalledWith(5, 'git', ['commit', '-m', expect.any(String)]);
    expect(exec).toHaveBeenNthCalledWith(6, 'git', ['tag', '-a', expect.any(String), '-m', expect.any(String)]);
  });
});