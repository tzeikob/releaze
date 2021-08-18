'use strict';

const check = require('../lib/ops/check');
const bump = require('../lib/ops/bump');
const range = require('../lib/ops/range');
const log = require('../lib/ops/log');
const changelog = require('../lib/ops/changelog');
const tag = require('../lib/ops/tag');
const cli = require('../lib/cli');
const logger = require('../lib/util/logger');

jest.mock('../lib/ops/check');
jest.mock('../lib/ops/bump');
jest.mock('../lib/ops/range');
jest.mock('../lib/ops/log');
jest.mock('../lib/ops/changelog');
jest.mock('../lib/ops/tag');

beforeEach(() => {
  check.mockResolvedValue({ version: '1.0.0' });
  bump.mockResolvedValue({ current: '1.0.0', next: '2.0.0', isPrerelease: false });
  range.mockResolvedValue({ from: '1.0.0', to: 'HEAD' });
  log.mockResolvedValue(['log1', 'log2', 'log3']);
  changelog.mockResolvedValue({ filename: 'CHANGELOG.md', append: false });
  tag.mockResolvedValue({ name: 'v2.0.0', hash: 'd3f884f' });
});

afterEach(() => {
  check.mockReset();
  bump.mockReset();
  range.mockReset();
  log.mockReset();
  changelog.mockReset();
  tag.mockReset();

  logger.level = 'INFO';
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

    expect(bump).not.toBeCalled();
    expect(range).not.toBeCalled();
    expect(log).not.toBeCalled();
    expect(changelog).not.toBeCalled();
    expect(tag).not.toBeCalled();
  });

  test.each([
    '--help', '--version'
  ])('skips any release operations when called with %p', async (arg) => {
    expect.assertions(7);

    await expect(cli.run(['./node', './releaze', arg])).resolves.toBeUndefined();

    expect(check).not.toBeCalled();
    expect(bump).not.toBeCalled();
    expect(range).not.toBeCalled();
    expect(log).not.toBeCalled();
    expect(changelog).not.toBeCalled();
    expect(tag).not.toBeCalled();
  });
});

describe('Cli should bump, update CHANGELOG and tag when called with', () => {
  test.each([
    [['--bump', 'major'], '%h %s', 'Bump to v%s'],
    [['--bump', 'major', '--changelog', '--git'], '%h %s', 'Bump to v%s'],
    [['--bump', 'major', '--changelog', '--format', '* %h', '--git', '--message', 'Release'], '* %h', 'Release']
  ])('%p using %p as format and %p as message', async (args, format, message) => {
    expect.assertions(17);

    await expect(cli.run(['./node', './releaze', ...args])).resolves.toBeUndefined();

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

  test.each([
    [['--bump', 'premajor', '--preid', 'alpha'], '%h %s', 'Bump to v%s']
  ])('%p using %p as format and %p as message', async (args, format, message) => {
    expect.assertions(17);

    bump.mockResolvedValue({ current: '1.0.0', next: '2.0.0-alpha.0', isPrerelease: true });

    await expect(cli.run(['./node', './releaze', ...args])).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('premajor', 'alpha');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).toBeCalledTimes(1);
    expect(range).toBeCalledWith(true);
    expect(range).toHaveBeenCalledAfter(bump);

    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith({ from: '1.0.0', to: 'HEAD' }, format);
    expect(log).toHaveBeenCalledAfter(range);

    expect(changelog).toBeCalledTimes(1);
    expect(changelog).toBeCalledWith('2.0.0-alpha.0', ['log1', 'log2', 'log3']);
    expect(changelog).toHaveBeenCalledAfter(log);

    expect(tag).toBeCalledTimes(1);
    expect(tag).toBeCalledWith('2.0.0-alpha.0', message);
    expect(tag).toHaveBeenCalledAfter(changelog);
  });
});

describe('Cli should set the logging level of the logger', () => {
  test.each([
    ['INFO', ['--bump', 'major']],
    ['VERBOSE', ['--bump', 'major', '--verbose']]
  ])('to %p when called with %p', async (level, args) => {
    expect.assertions(2);

    await expect(cli.run(['./node', './releaze', ...args])).resolves.toBeUndefined();

    expect(logger.level).toBe(level);
  });
});

describe('Cli should not try to', () => {
  test('update the CHANGELOG when the --no-changelog opt-out option is given', async () => {
    expect.assertions(11);

    const args = ['./node', './releaze', '--bump', 'major', '--no-changelog'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).not.toBeCalled();
    expect(log).not.toBeCalled();
    expect(changelog).not.toBeCalled();

    expect(tag).toBeCalledTimes(1);
    expect(tag).toBeCalledWith('2.0.0', 'Bump to v%s');
    expect(tag).toHaveBeenCalledAfter(bump);
  });

  test('commit and tag when the --no-git opt-out option is given', async () => {
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

    expect(tag).not.toBeCalled();
  });

  test('update CHANGELOG, commit and tag when both --no-changelog and --no-git opts are given', async () => {
    expect.assertions(9);

    const args = ['./node', './releaze', '--bump', 'major', '--no-changelog', '--no-git'];

    await expect(cli.run(args)).resolves.toBeUndefined();

    expect(check).toBeCalledTimes(1);

    expect(bump).toBeCalledTimes(1);
    expect(bump).toBeCalledWith('major');
    expect(bump).toHaveBeenCalledAfter(check);

    expect(range).not.toBeCalled();
    expect(log).not.toBeCalled();
    expect(changelog).not.toBeCalled();
    expect(tag).not.toBeCalled();
  });
});

describe('Cli should reject immediately when', () => {
  test.each([
    [[]],
    [['--bump', 'new']],
    [['--bump', '']],
    [['--preid', 'alpha']],
    [['--bump', 'major', '--format', '%s']],
    [['--bump', 'major', '--no-changelog', '--format', '%s']],
    [['--bump', 'major', '--message', 'Bump to v%s']],
    [['--bump', 'major', '--no-git', '--message', '%s']],
    [['--bump', 'major', '--boom']]
  ])('called with %p', async (args) => {
    expect.assertions(7);

    await expect(cli.run(['./node', './releaze', ...args])).rejects.toThrow(Error);

    expect(check).not.toBeCalled();
    expect(bump).not.toBeCalled();
    expect(range).not.toBeCalled();
    expect(log).not.toBeCalled();
    expect(changelog).not.toBeCalled();
    expect(tag).not.toBeCalled();
  });
});

describe('Cli should reject immediately skipping', () => {
  test('range, log, changelog and tag ops if bump throws a fatal error', async () => {
    expect.assertions(5);

    const reason = 'Failed to execute bump operation';

    bump.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(range).not.toBeCalled();
    expect(log).not.toBeCalled();
    expect(changelog).not.toBeCalled();
    expect(tag).not.toBeCalled();
  });

  test('log, changelog and tag ops if range throws a fatal error', async () => {
    expect.assertions(4);

    const reason = 'Failed to execute range operation';

    range.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(log).not.toBeCalled();
    expect(changelog).not.toBeCalled();
    expect(tag).not.toBeCalled();
  });

  test('changelog and tag ops if log throws a fatal error', async () => {
    expect.assertions(3);

    const reason = 'Failed to execute log operation';

    log.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(changelog).not.toBeCalled();
    expect(tag).not.toBeCalled();
  });

  test('tag op if changelog throws a fatal error', async () => {
    expect.assertions(2);

    const reason = 'Failed to execute changelog operation';

    changelog.mockRejectedValue(new Error(reason));

    const args = ['./node', './releaze', '--bump', 'major'];

    await expect(cli.run(args)).rejects.toThrow(reason);

    expect(tag).not.toBeCalled();
  });
});