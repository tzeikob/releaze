const fs = require('fs');
const path = require('path');
const semver = require('semver');
const exec = require('../lib/util/exec');
const ExecError = require('../lib/errors/exec-error');
const tag = require('../lib/tag.js');

jest.mock('fs', () => ({
  promises: {
    access: jest.fn().mockResolvedValue()
  }
}));

jest.mock('../lib/util/exec', () => jest.fn().mockResolvedValue());

const { access } = fs.promises;
const { any } = expect;

const pathToPackageJSON = path.join(process.cwd(), 'package.json');
const pathToChangelogMD = path.join(process.cwd(), 'CHANGELOG.md');
const pathToPackageLockJSON = path.join(process.cwd(), 'package-lock.json');
const pathToShrinkwrapJSON = path.join(process.cwd(), 'npm-shrinkwrap.json');

afterEach(() => {
  access.mockReset();
  exec.mockReset();
});

describe('Tag should resolve to undefined', () => {
  test('have add, commit and tag git commands executed in a strict order', async () => {
    expect.assertions(8);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', pathToPackageJSON]);
    expect(exec).nthCalledWith(2, 'git', ['add', pathToChangelogMD]);
    expect(exec).nthCalledWith(3, 'git', ['add', pathToPackageLockJSON]);
    expect(exec).nthCalledWith(4, 'git', ['add', pathToShrinkwrapJSON]);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });

  test('have missing CHANGELOG.md, package-lock.json and npm-shrinkwrap.json skipped from staging', async () => {
    expect.assertions(12);

    access.mockRejectedValueOnce('CHANGELOG.md not found');
    access.mockRejectedValueOnce('package-lock.json not found');
    access.mockRejectedValueOnce('npm-shrinkwrap.json not found');

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(access).toBeCalledTimes(3);
    expect(exec).toBeCalledTimes(3);

    expect(exec).nthCalledWith(1, 'git', ['add', pathToPackageJSON]);

    expect(access).nthCalledWith(1, pathToChangelogMD);
    expect(exec).not.toBeCalledWith('git', ['add', pathToChangelogMD]);

    expect(access).nthCalledWith(2, pathToPackageLockJSON);
    expect(exec).not.toBeCalledWith('git', ['add', pathToPackageLockJSON]);

    expect(access).nthCalledWith(3, pathToShrinkwrapJSON);
    expect(exec).not.toBeCalledWith('git', ['add', pathToShrinkwrapJSON]);

    expect(exec).nthCalledWith(2, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(3, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });
});

describe('Tag should try to commit changes', () => {
  test('with the default message if message arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to v${version}`]);
  });

  test('with message equal to the given message arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump to new version ${version}`;

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', message]);
  });

  test('with template message using interpolation via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to new v${version}`]);
  });

  test('with version injected into the message template in a clean semver form', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to new v${semver.clean(version)}`]);
  });
});

describe('Tag should try to create an annotation tag', () => {
  test('with tag name equal to the given version arg in the `v1.0.0` form', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', `v${version}`, '-m', any(String)]);
  });

  test('having the given version arg be cleaned via semver before used as tag name', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', `v${semver.clean(version)}`, '-m', any(String)]);
  });

  test('with the default message if the message arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to v${version}`]);
  });

  test('with message equal to the given message arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump to new version ${version}`;

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', message]);
  });

  test('with a template message using interpolation via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to new v${version}`]);
  });

  test('having the given version arg be cleaned via semver before used in the template message', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to new v${semver.clean(version)}`]);
  });
});

describe('Tag called with invalid input should reject early with error', () => {
  test('when version argument is not given', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag()).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(0);
    expect(exec).toBeCalledTimes(0);
  });

  test('when invalid non semver version argument is given', async () => {
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

    expect(access).toBeCalledTimes(0);
    expect(exec).toBeCalledTimes(0);
  });

  test('when invalid non string template message argument is given', async () => {
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

    expect(access).toBeCalledTimes(0);
    expect(exec).toBeCalledTimes(0);
  });
});

describe('Tag should reject early with error', () => {
  test('when `git add package.json` throws a fatal exec error', async () => {
    expect.assertions(4);

    const reason = 'An error occurred executing `git add package.json`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(0);
    expect(exec).toBeCalledTimes(1);

    expect(exec).toBeCalledWith('git', ['add', pathToPackageJSON]);
  });

  test('when `git add CHANGELOG.md` throws a fatal exec error', async () => {
    expect.assertions(6);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockResolvedValueOnce('CHANGELOG.md exists');
    const reason = 'An error occurred executing `git add CHANGELOG.md`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(1);
    expect(exec).toBeCalledTimes(2);

    expect(exec).nthCalledWith(1, 'git', ['add', pathToPackageJSON]);

    expect(access).toBeCalledWith(pathToChangelogMD);
    expect(exec).nthCalledWith(2, 'git', ['add', pathToChangelogMD]);
  });

  test('when `git add package-lock.json` throws a fatal exec error', async () => {
    expect.assertions(7);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockRejectedValueOnce(new Error('CHANGELOG.md file not found'));

    access.mockResolvedValueOnce('package-lock.json exists');
    const reason = 'An error occurred executing `git add package-lock.js`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(2);
    expect(exec).toBeCalledTimes(2);

    expect(exec).nthCalledWith(1, 'git', ['add', pathToPackageJSON]);

    expect(access).nthCalledWith(1, pathToChangelogMD);

    expect(access).nthCalledWith(2, pathToPackageLockJSON);
    expect(exec).nthCalledWith(2, 'git', ['add', pathToPackageLockJSON]);
  });

  test('when `git add npm-shrinkwrap.json` throws a fatal exec error', async () => {
    expect.assertions(8);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockRejectedValueOnce(new Error('CHANGELOG.md file not found'));
    access.mockRejectedValueOnce(new Error('package-lock.json file not found'));

    access.mockResolvedValueOnce('npm-shrinkwrap.json exists');
    const reason = 'An error occurred executing `git add npm-shrinkwrap.json`';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(3);
    expect(exec).toBeCalledTimes(2);

    expect(exec).nthCalledWith(1, 'git', ['add', pathToPackageJSON]);

    expect(access).nthCalledWith(1, pathToChangelogMD);
    expect(access).nthCalledWith(2, pathToPackageLockJSON);

    expect(access).nthCalledWith(3, pathToShrinkwrapJSON);
    expect(exec).nthCalledWith(2, 'git', ['add', pathToShrinkwrapJSON]);
  });

  test('when `git commit` throws a fatal exec error', async () => {
    expect.assertions(8);
  
    exec.mockResolvedValueOnce('package.json staged successfully');
    
    access.mockRejectedValueOnce('CHANGELOG.md not found');
    access.mockRejectedValueOnce('package-lock.json not found');
    access.mockRejectedValueOnce('npm-shrinkwrap.json not found');
  
    const reason = 'An error occurred executing git commit';
    exec.mockRejectedValueOnce(new ExecError(reason));
  
    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(3);
    expect(exec).toBeCalledTimes(2);
  
    expect(exec).nthCalledWith(1, 'git', ['add', pathToPackageJSON]);

    expect(access).nthCalledWith(1, pathToChangelogMD);
    expect(access).nthCalledWith(2, pathToPackageLockJSON);
    expect(access).nthCalledWith(3, pathToShrinkwrapJSON);

    expect(exec).nthCalledWith(2, 'git', ['commit', '-m', any(String)]);
  });

  test('when `git tag` throws a fatal exec error', async () => {
    expect.assertions(9);

    exec.mockResolvedValueOnce('package.json staged successfully');

    access.mockRejectedValueOnce('CHANGELOG.md not found');
    access.mockRejectedValueOnce('package-lock.json not found');
    access.mockRejectedValueOnce('npm-shrinkwrap.json not found');

    exec.mockResolvedValueOnce('commit changes successfully');

    const reason = 'An error occurred executing git tag';
    exec.mockRejectedValueOnce(new ExecError(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(3);
    expect(exec).toBeCalledTimes(3);

    expect(exec).nthCalledWith(1, 'git', ['add', pathToPackageJSON]);

    expect(access).nthCalledWith(1, pathToChangelogMD);
    expect(access).nthCalledWith(2, pathToPackageLockJSON);
    expect(access).nthCalledWith(3, pathToShrinkwrapJSON);

    expect(exec).nthCalledWith(2, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(3, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });
});