const exec = require('../../lib/util/exec');
const log = require('../../lib/ops/log.js');

jest.mock('../../lib/util/exec');

const { arrayContaining } = expect;

beforeEach(() => {
  exec.mockResolvedValue('log1\nlog2\nlog3');
});

afterEach(() => {
  exec.mockReset();
});

describe('Log should be an async operation', () => {
  test('getting as input an optional range object arg with schema `{ from, to }`', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();
    await expect(log(null)).resolves.toBeDefined();
    await expect(log({ from: '84e2fa8', to: 'HEAD' })).resolves.toBeDefined();
  });

  test('where both `from` and `to` props in the range arg could be nullish or undefined', async () => {
    expect.assertions(6);

    await expect(log({})).resolves.toBeDefined();
    await expect(log({ from: null })).resolves.toBeDefined();
    await expect(log({ to: null })).resolves.toBeDefined();
    await expect(log({ from: null, to: null })).resolves.toBeDefined();
    await expect(log({ from: null, to: '84e2fa8' })).resolves.toBeDefined();
    await expect(log({ from: '84e2fa8', to: null })).resolves.toBeDefined();
  });

  test('where `from` prop in range arg should be a valid git ref (hash, semver tag, HEAD)', async () => {
    expect.assertions(11);

    const reason = 'Invalid from range argument';

    await expect(log({ from: 'c26GGG' })).rejects.toThrow(reason);
    await expect(log({ from: 'c262349^' })).rejects.toThrow(reason);
    await expect(log({ from: '^c262349' })).rejects.toThrow(reason);
    await expect(log({ from: 'v1.33.a4' })).rejects.toThrow(reason);
    await expect(log({ from: '1.33' })).rejects.toThrow(reason);
    await expect(log({ from: '01.33.a4' })).rejects.toThrow(reason);
    await expect(log({ from: '..' })).rejects.toThrow(reason);
    await expect(log({ from: '...' })).rejects.toThrow(reason);
    await expect(log({ from: 'head' })).rejects.toThrow(reason);
    await expect(log({ from: '' })).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });

  test('where `to` prop in range arg should be a valid git ref (hash, semver tag, HEAD)', async () => {
    expect.assertions(11);

    const reason = 'Invalid to range argument';

    await expect(log({ to: 'c26GGG' })).rejects.toThrow(reason);
    await expect(log({ to: 'c262349^' })).rejects.toThrow(reason);
    await expect(log({ to: '^c262349' })).rejects.toThrow(reason);
    await expect(log({ to: 'v1.33.a4' })).rejects.toThrow(reason);
    await expect(log({ to: '1.33' })).rejects.toThrow(reason);
    await expect(log({ to: '01.33.a4' })).rejects.toThrow(reason);
    await expect(log({ to: '..', })).rejects.toThrow(reason);
    await expect(log({ to: '...' })).rejects.toThrow(reason);
    await expect(log({ to: 'head' })).rejects.toThrow(reason);
    await expect(log({ to: '' })).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });
  
  test('where both `from` and `to` props should be a valid git ref (hash, semver tag, HEAD)', async () => {
    expect.assertions(4);

    await expect(log({ from: '', })).rejects.toThrow(Error);
    await expect(log({ to: '' })).rejects.toThrow(Error);
    await expect(log({ from: '', to: '' })).rejects.toThrow(Error);

    expect(exec).toBeCalledTimes(0);
  });

  test('getting as input another optional format arg', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();
    await expect(log(null, null)).resolves.toBeDefined();
    await expect(log(null, '%h $s')).resolves.toBeDefined();
  });

  test('resolving always to an array', async () => {
    expect.assertions(1);

    await expect(log()).resolves.toBeInstanceOf(Array);
  });

  test('resolving to an array of git log strings', async () => {
    expect.assertions(2);

    exec.mockResolvedValue(`line1\n`);

    await expect(log()).resolves.toEqual(['line1']);

    exec.mockResolvedValue(`line1\nline2\nline3\n`);

    await expect(log()).resolves.toEqual(['line1', 'line2', 'line3']);
  });

  test('resolving to an empty array when `git log` process returns no logs', async () => {
    expect.assertions(2);

    exec.mockResolvedValue(`\n`);

    await expect(log()).resolves.toEqual([]);

    exec.mockResolvedValue('');

    await expect(log()).resolves.toEqual([]);
  });

  test('have spawn thew `git log` process once with `--no-merges` and `--oneline` opts', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', arrayContaining(['log', '--no-merges', '--oneline']));
  });
});

describe('Log should spawn the `git log` process once with a format template', () => {
  test('equal to the default format `%h %s` if format arg is not given', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s']);
  });

  test('equal to the given format arg', async () => {
    expect.assertions(3);

    const format = '%h %s';

    await expect(log(null, format)).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', `--format=${format}`]);
  });
});

describe('Log should spawn the `git log` process once with a range notation', () => {
  test('as `ref...ref` when the range arg is given with both `from` and `to` props', async () => {
    expect.assertions(3);

    await expect(log({ from: '871647f', to: '84e2fa8' })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', '871647f..84e2fa8']);
  });

  test('as `ref..HEAD` when the range arg is given with only the `from` prop', async () => {
    expect.assertions(3);

    await expect(log({ from: '871647f', to: null })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', '871647f..HEAD']);
  });

  test('as `ref` when the range arg is given with only the `to` prop', async () => {
    expect.assertions(3);

    await expect(log({ from: null, to: '84e2fa8' })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', '84e2fa8']);
  });

  test('as `ref..HEAD` where the range arg has the `to` prop set to `HEAD`', async () => {
    expect.assertions(3);

    await expect(log({ from: '84e2fa8', to: 'HEAD' })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', '84e2fa8..HEAD']);
  });

  test('as `HEAD` when the range arg is given with only `to` prop set to `HEAD`', async () => {
    expect.assertions(3);

    await expect(log({ from: null, to: 'HEAD' })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', 'HEAD']);
  });

  test('as `HEAD..HEAD` when the range arg is given with both `from` and `to` set to `HEAD`', async () => {
    expect.assertions(3);

    await expect(log({ from: 'HEAD', to: 'HEAD' })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', 'HEAD..HEAD']);
  });
  
  test('with no range notation when the range arg is given as empty object', async () => {
    expect.assertions(3);

    await expect(log({})).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s']);
  });

  test('with no range notation when the range arg is given with nullish props', async () => {
    expect.assertions(3);

    await expect(log({ from: null, to: null })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s']);
  });

  test('with no range notation when the range arg is not given', async () => {
    expect.assertions(3);

    await expect(log()).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s']);
  });
});

describe('Log should should support ranges given as semver tag names', () => {
  test('where both `from` and `to` are given as valid semver versions', async () => {
    expect.assertions(3);

    await expect(log({ from: '1.0.0', to: '2.0.0' })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', '1.0.0..2.0.0']);
  });

  test('where only the `from` is given as valid semver versions', async () => {
    expect.assertions(3);

    await expect(log({ from: '1.0.0', to: null })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', '1.0.0..HEAD']);
  });

  test('where only the `to` is given as valid semver versions', async () => {
    expect.assertions(3);

    await expect(log({ from: null, to: '2.0.0' })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', '2.0.0']);
  });

  test('where either `from` and `to` are given as valid semver versions in `v1.0.0` form', async () => {
    expect.assertions(3);

    await expect(log({ from: 'v1.0.0', to: `v2.0.0` })).resolves.toBeDefined();

    expect(exec).toBeCalledTimes(1);
    expect(exec).toBeCalledWith('git', ['log', '--no-merges', '--oneline', '--format=%h %s', 'v1.0.0..v2.0.0']);
  });
});

describe('Log should reject with error', () => {
  test('when `git log` process throws a fatal error', async () => {
    expect.assertions(2);

    const reason = 'A fatal error occurred executing: git log';

    exec.mockRejectedValue(new Error(reason));

    await expect(log()).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(1);
  });
});