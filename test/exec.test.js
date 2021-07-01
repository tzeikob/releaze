jest.mock('child_process');

const { execFile } = require('child_process');
const exec = require('../lib/util/exec');

afterEach(() => {
  execFile.mockReset();
});

describe('Exec should reject with an error', () => {
  test('early when called without `file` argument', async () => {
    expect.assertions(2);

    const reason = 'Invalid or missing file argument';

    await (expect(exec())).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('early when called with invalid non string `file` argument', async () => {
    expect.assertions(10);

    const reason = 'Invalid or missing file argument';

    await (expect(exec(123))).rejects.toThrow(reason);
    await (expect(exec(true))).rejects.toThrow(reason);
    await (expect(exec(NaN))).rejects.toThrow(reason);
    await (expect(exec(null))).rejects.toThrow(reason);
    await (expect(exec(''))).rejects.toThrow(reason);
    await (expect(exec({}))).rejects.toThrow(reason);
    await (expect(exec([]))).rejects.toThrow(reason);
    await (expect(exec(Symbol('s')))).rejects.toThrow(reason);
    await (expect(exec(() => {}))).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('early when called with invalid non array `args` argument', async () => {
    expect.assertions(8);

    const reason = 'Invalid non array args argument';

    await (expect(exec('ls', 123))).rejects.toThrow(reason);
    await (expect(exec('ls', true))).rejects.toThrow(reason);
    await (expect(exec('ls', NaN))).rejects.toThrow(reason);
    await (expect(exec('ls', ''))).rejects.toThrow(reason);
    await (expect(exec('ls', {}))).rejects.toThrow(reason);
    await (expect(exec('ls', Symbol('s')))).rejects.toThrow(reason);
    await (expect(exec('ls', () => {}))).rejects.toThrow(reason);

    expect(execFile).toHaveBeenCalledTimes(0);
  });

  test('when `child_process/execFile` calls back with a fatal error', async () => {
    expect.assertions(1);

    const reason = 'A fatal error occurred';

    execFile.mockImplementation((file, args, cb) => cb(new Error(reason), null, null));

    await expect(exec('node', ['-version'])).rejects.toThrow(reason);
  });

  test('when `child_process/execFile` calls back with a stderr', async () => {
    expect.assertions(1);

    const reason = 'A fatal error occurred';

    execFile.mockImplementation((file, args, cb) => cb(null, null, reason));

    await expect(exec('node', ['-version'])).rejects.toThrow(reason);
  });
});

describe('Exec should resolve', () => {
  test('calling `child_process/execFile` only once', async () => {
    expect.assertions(1);

    execFile.mockImplementation((file, args, cb) => cb(null, 'v14.6.1', null));

    await exec('node', ['-version']);

    expect(execFile).toHaveBeenCalledTimes(1);
  });

  test('calling `child_process/execFile` with the given file, args and an internal callback', async () => {
    expect.assertions(1);

    execFile.mockImplementation((file, args, cb) => cb(null, 'v14.6.1', null));

    await exec('node', ['-version']);

    expect(execFile).toHaveBeenCalledWith('node', ['-version'], expect.any(Function));
  });

  test('with the `stdout` value the `child_process/execFile` calls back', async () => {
    expect.assertions(1);

    const stdout = 'v14.6.1';

    execFile.mockImplementation((file, args, cb) => cb(null, stdout, null));

    await expect(exec('node', ['-version'])).resolves.toBe(stdout);
  });

  test('with the `stdout` value the `child_process/execFile` calls back given no `args` argument', async () => {
    expect.assertions(1);

    const stdout = 'Thu Jul  1 10:52:41 EEST 2021';

    execFile.mockImplementation((file, args, cb) => cb(null, stdout, null));

    await expect(exec('date')).resolves.toBe(stdout);
  });
});