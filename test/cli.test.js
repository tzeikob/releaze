'use strict';

const exec = require('../lib/util/exec');
const check = require('../lib/ops/check');
const bump = require('../lib/ops/bump');
const range = require('../lib/ops/range');
const log = require('../lib/ops/log');
const changelog = require('../lib/ops/changelog');
const tag = require('../lib/ops/tag');
const cli = require('../lib/cli');
const logger = require('../lib/util/logger');

jest.mock('../lib/util/exec');
jest.mock('../lib/ops/check');
jest.mock('../lib/ops/bump');
jest.mock('../lib/ops/range');
jest.mock('../lib/ops/log');
jest.mock('../lib/ops/changelog');
jest.mock('../lib/ops/tag');

jest.mock('../lib/util/logger', () => ({
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn()
}));

beforeEach(() => {
  exec.mockResolvedValue();
  check.mockResolvedValue({ version: '1.0.0' });
  bump.mockResolvedValue({ current: '1.0.0', next: '2.0.0', isPrerelease: false });
  range.mockResolvedValue({ from: '1.0.0', to: 'HEAD' });
  log.mockResolvedValue(['log1', 'log2', 'log3']);
  changelog.mockResolvedValue();
  tag.mockResolvedValue({ name: 'v2.0.0', hash: 'd3f884f' });
});

afterEach(() => {
  exec.mockReset();
  check.mockReset();
  bump.mockReset();
  range.mockReset();
  log.mockReset();
  changelog.mockReset();
  tag.mockReset();
  logger.info.mockReset();
  logger.success.mockReset();
  logger.error.mockReset();
});

describe('Cli module should export an async run operation which', () => {
  test('getting as input an array of process arguments', async () => {
    expect.assertions(1);

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).resolves.toBeUndefined();
  });

  test('checking once if all pre-conditions are met', async () => {
    expect.assertions(2);

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);
  });

  test('rejecting immediately if any pre-conditions are not met', async () => {
    expect.assertions(7);

    const reason = 'Invalid or missing semver version in package.json';

    check.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(check).toBeCalledTimes(1);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('requested the help is skipping any release operations', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--help'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('requested the version is skipping any release operations', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--version'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });
});

describe('Cli should take care of testing', () => {
  test('running testing right after checking the pre-conditions if `--test` opt is given', async () => {
    expect.assertions(5);

    const args = ['./node', './releaze', '--bump', 'major', '--test'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('npm', ['test']);
    expect(exec).toHaveBeenCalledAfter(check);
  });

  test('rejecting immediately if testing has not been passed', async () => {
    expect.assertions(10);

    const reason = 'Failed to pass testing';

    exec.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major', '--test'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(check).toBeCalledTimes(1);

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('npm', ['test']);
    expect(exec).toHaveBeenCalledAfter(check);

    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('skipping testing if `--test` option is missing', async () => {
    expect.assertions(8);

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(exec).not.toBeCalledWith('npm', ['test']);

    expect(bump).toBeCalledTimes(1);
    expect(range).toBeCalledTimes(1);
    expect(log).toBeCalledTimes(1);
    expect(changelog).toBeCalledTimes(1);
    expect(tag).toBeCalledTimes(1);
  });

  test('skipping testing if `--no-test` option is used', async () => {
    expect.assertions(8);

    const args = ['./node', './releaze', '--bump', 'major', '--no-test'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(exec).not.toBeCalledWith('npm', ['test']);

    expect(bump).toBeCalledTimes(1);
    expect(range).toBeCalledTimes(1);
    expect(log).toBeCalledTimes(1);
    expect(changelog).toBeCalledTimes(1);
    expect(tag).toBeCalledTimes(1);
  });
});

describe('Cli should bump up, update CHANGELOG, commit and tag', () => {
  test('given only the `--bump` option, using the default `--format` and `--message`', async () => {
    expect.assertions(17);

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(1);
    expect(range).toBeCalledWith(false);
    expect(range).toHaveBeenCalledAfter(bump);

    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith({ from: '1.0.0', to: 'HEAD' }, '%h %s');
    expect(log).toHaveBeenCalledAfter(range);

    expect(changelog).toBeCalledTimes(1);
    expect(changelog).toBeCalledWith('2.0.0', ['log1', 'log2', 'log3']);
    expect(changelog).toHaveBeenCalledAfter(log);

    expect(tag).toBeCalledTimes(1);
    expect(tag).toBeCalledWith('2.0.0', 'Bump to v%s');
    expect(tag).toHaveBeenCalledAfter(changelog);
  });

  test('given the `--bump` along with only the `--changelog` and `--git` options', async () => {
    expect.assertions(17);

    const args = ['./node', './releaze', '--bump', 'major', '--changelog', '--git'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(1);
    expect(range).toBeCalledWith(false);
    expect(range).toHaveBeenCalledAfter(bump);

    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith({ from: '1.0.0', to: 'HEAD' }, '%h %s');
    expect(log).toHaveBeenCalledAfter(range);

    expect(changelog).toBeCalledTimes(1);
    expect(changelog).toBeCalledWith('2.0.0', ['log1', 'log2', 'log3']);
    expect(changelog).toHaveBeenCalledAfter(log);

    expect(tag).toBeCalledTimes(1);
    expect(tag).toBeCalledWith('2.0.0', 'Bump to v%s');
    expect(tag).toHaveBeenCalledAfter(changelog);
  });

  test('given the `--bump` along with `--changelog --format` and `--git --message` options', async () => {
    expect.assertions(17);

    const format = '%s';
    const message = 'Release ver. %s';

    const args = [
      './node', './releaze',
      '--bump', 'major',
      '--changelog', '--format', format,
      '--git', '--message', message
    ];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(1);
    expect(range).toBeCalledWith(false);
    expect(range).toHaveBeenCalledAfter(bump);

    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith({ from: '1.0.0', to: 'HEAD' }, format);
    expect(log).toHaveBeenCalledAfter(range);

    expect(changelog).toBeCalledTimes(1);
    expect(changelog).toBeCalledWith('2.0.0', ['log1', 'log2', 'log3']);
    expect(changelog).toHaveBeenCalledAfter(log);

    expect(tag).toBeCalledTimes(1);
    expect(tag).toBeCalledWith('2.0.0', message);
    expect(tag).toHaveBeenCalledAfter(changelog);
  });

  test('given the `--bump` a pre-release type along with a `--preid` option', async () => {
    expect.assertions(17);

    bump.mockResolvedValue({ current: '1.0.0', next: '2.0.0-alpha.0', isPrerelease: true });

    const args = ['./node', './releaze', '--bump', 'premajor', '--preid', 'alpha'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('premajor', 'alpha');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(1);
    expect(range).toBeCalledWith(true);
    expect(range).toHaveBeenCalledAfter(bump);

    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith({ from: '1.0.0', to: 'HEAD' }, '%h %s');
    expect(log).toHaveBeenCalledAfter(range);

    expect(changelog).toBeCalledTimes(1);
    expect(changelog).toBeCalledWith('2.0.0-alpha.0', ['log1', 'log2', 'log3']);
    expect(changelog).toHaveBeenCalledAfter(log);

    expect(tag).toBeCalledTimes(1);
    expect(tag).toBeCalledWith('2.0.0-alpha.0', 'Bump to v%s');
    expect(tag).toHaveBeenCalledAfter(changelog);
  });
});

describe('Cli should report progress to console via logger', () => {
  test('when a stable bump release without `--test` is requested', async () => {
    expect.assertions(12);

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(logger.info).toBeCalledTimes(5);
    expect(logger.success).toBeCalledTimes(4);

    expect(logger.info).nthCalledWith(1, 'Checking npm and git pre-conditions...');
    expect(logger.success).nthCalledWith(1, 'All npm and git pre-conditions are met.', 2);

    expect(logger.info).nthCalledWith(2, 'Bumping to next major version...');
    expect(logger.success).nthCalledWith(2, `Version bumped from 1.0.0 \u2933 major 2.0.0.`, 2);

    expect(logger.info).nthCalledWith(3, 'Writing changes to changelog file...');
    expect(logger.success).nthCalledWith(3, 'The CHANGELOG.md file has been updated.', 2);

    expect(logger.info).nthCalledWith(4, 'Creating a new bump release tag...');
    expect(logger.success).nthCalledWith(4, `Tag v2.0.0 \u1F812 d3f884f has been created.`, 2);

    expect(logger.info).nthCalledWith(5, 'Release has been completed successfully.');
  });

  test('when a stable bump release with `--test` is requested', async () => {
    expect.assertions(14);

    const args = ['./node', './releaze', '--bump', 'major', '--test'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(logger.info).toBeCalledTimes(6);
    expect(logger.success).toBeCalledTimes(5);

    expect(logger.info).nthCalledWith(1, 'Checking npm and git pre-conditions...');
    expect(logger.success).nthCalledWith(1, 'All npm and git pre-conditions are met.', 2);

    expect(logger.info).nthCalledWith(2, 'Running all unit and integration tests...');
    expect(logger.success).nthCalledWith(2, 'All tests have been passed.', 2);

    expect(logger.info).nthCalledWith(3, 'Bumping to next major version...');
    expect(logger.success).nthCalledWith(3, `Version bumped from 1.0.0 \u2933 major 2.0.0.`, 2);

    expect(logger.info).nthCalledWith(4, 'Writing changes to changelog file...');
    expect(logger.success).nthCalledWith(4, 'The CHANGELOG.md file has been updated.', 2);

    expect(logger.info).nthCalledWith(5, 'Creating a new bump release tag...');
    expect(logger.success).nthCalledWith(5, `Tag v2.0.0 \u1F812 d3f884f has been created.`, 2);

    expect(logger.info).nthCalledWith(6, 'Release has been completed successfully.');
  });

  test('when a pre-release is requested', async () => {
    expect.assertions(3);

    const args = ['./node', './releaze', '--bump', 'premajor', '--preid', 'alpha'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(logger.info).toBeCalledTimes(5);
    expect(logger.info).nthCalledWith(2, 'Bumping to next premajor version with alpha preid...');
  });
});

describe('Cli should not try to', () => {
  test('update the CHANGELOG when the `--no-changelog` opt-out option is given', async () => {
    expect.assertions(11);

    const args = ['./node', './releaze', '--bump', 'major', '--no-changelog'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);

    expect(tag).toBeCalledTimes(1);
    expect(tag).toBeCalledWith('2.0.0', 'Bump to v%s');
    expect(tag).toHaveBeenCalledAfter(bump);
  });

  test('commit and tag when the `--no-git` opt-out option is given', async () => {
    expect.assertions(15);

    const args = ['./node', './releaze', '--bump', 'major', '--no-git'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(1);
    expect(range).toBeCalledWith(false);
    expect(range).toHaveBeenCalledAfter(bump);

    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith({ from: '1.0.0', to: 'HEAD' }, '%h %s');
    expect(log).toHaveBeenCalledAfter(range);

    expect(changelog).toBeCalledTimes(1);
    expect(changelog).toBeCalledWith('2.0.0', ['log1', 'log2', 'log3']);
    expect(changelog).toHaveBeenCalledAfter(log);

    expect(tag).toBeCalledTimes(0);
  });

  test('update CHANGELOG, commit and tag when both `--no-changelog` and `--no-git` options are given', async () => {
    expect.assertions(9);

    const args = ['./node', './releaze', '--bump', 'major', '--no-changelog', '--no-git'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });
});

describe('Cli should reject immediately when', () => {
  test('the option `--bump` is not given', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('the option `--bump` is not given a valid semver release type', async () => {
    expect.assertions(8);

    let args = ['./node', './releaze', '--bump', 'new'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    args = ['./node', './releaze', '--bump', ''];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });
  
  test('the option `--preid` is given without the `--bump` option', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--preid', 'alpha'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('the option `--format` is given without the `--changelog` option', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--bump', 'major', '--format', '%s'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('the option `--format` is given along with the `--no-changelog` opt-out option', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--bump', 'major', '--no-changelog', '--format', '%s'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('the option `--message` is given without the `--git` option', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--bump', 'major', '--message', 'Bump to v%s'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('the option `--message` is given along with the `--no-git` opt-out option', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--bump', 'major', '--no-git', '--message', '%s'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('unknown option is given', async () => {
    expect.assertions(7);

    const args = ['./node', './releaze', '--bump', 'major', '--gito'];

    await expect(cli.run(args)).rejects.toThrow(Error);

    expect(check).toBeCalledTimes(0);
    expect(bump).toBeCalledTimes(0);
    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });
});

describe('Cli should reject immediately skipping', () => {
  test('range, log, changelog and tag ops if bump throws a fatal error', async () => {
    expect.assertions(5);

    const reason = 'Failed to execute bump operation';

    bump.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(range).toBeCalledTimes(0);
    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('log, changelog and tag ops if range throws a fatal error', async () => {
    expect.assertions(4);

    const reason = 'Failed to execute range operation';

    range.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(log).toBeCalledTimes(0);
    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('changelog and tag ops if log throws a fatal error', async () => {
    expect.assertions(3);

    const reason = 'Failed to execute log operation';

    log.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(changelog).toBeCalledTimes(0);
    expect(tag).toBeCalledTimes(0);
  });

  test('tag op if changelog throws a fatal error', async () => {
    expect.assertions(2);

    const reason = 'Failed to execute changelog operation';

    changelog.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(tag).toBeCalledTimes(0);
  });
});