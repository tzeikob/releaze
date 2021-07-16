const fs = require('fs');
const exec = require('../../lib/util/exec');
const check = require('../../lib/ops/check');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn()
  }
}));

jest.mock('../../lib/util/exec');

const { readFile, access } = fs.promises;
const { any } = expect;

beforeEach(() => {
  readFile.mockResolvedValue('{"version": "1.0.0"}');
  access.mockResolvedValue();
  exec.mockResolvedValue();
});

afterEach(() => {
  readFile.mockReset();
  access.mockReset();
  exec.mockReset();
});

describe('Check should be an async operation', () => {
  test('getting no args', async () => {
    expect.assertions(1);

    await expect(check()).resolves.toBeDefined();
  });

  test('resolving to an object', async () => {
    expect.assertions(1);

    await expect(check()).resolves.toBeInstanceOf(Object);
  });

  test('resolving to an object which is parsed from package.json', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"name": "my-app", "version": "1.0.0"}');

    await expect(check()).resolves.toMatchObject({
      name: any(String),
      version: any(String)
    });
  });
});

describe('Check should make sure it is running within a NPM project', () => {
  test('rejecting with error if package.json file does not exist', async () => {
    expect.assertions(3);

    const reason = 'Unable to find or open file: package.json';

    readFile.mockRejectedValue(new Error(reason));

    await expect(check()).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('rejecting with error if package.json file exist but has invalid json syntax', async () => {
    expect.assertions(3);

    readFile.mockResolvedValue('{version: "123"');

    await expect(check()).rejects.toThrow(SyntaxError);

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('rejecting with error if package file exist but has non-object JSON value', async () => {
    expect.assertions(3);

    readFile.mockResolvedValue('123');

    const reason = 'JSON is not a valid object in package.json';

    await expect(check()).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('rejecting with error if package.json file exist but has invalid semver version', async () => {
    expect.assertions(3);

    readFile.mockResolvedValue('{"version": "123"}');

    const reason = 'Invalid or missing semver version in package.json';

    await expect(check()).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });
});

describe('Check should make sure it is running within a git repo', () => {
  test('rejecting with an error if `.git/index` file does not exist', async () => {
    expect.assertions(3);

    const reason = 'Unable to access file: .git/index';

    access.mockRejectedValue(new Error(reason));

    await expect(check()).rejects.toThrow(reason);

    expect(access).toBeCalledTimes(1);
    expect(access).toBeCalledWith('.git/index');
  });

  test('rejecting with an error if there are no commits yet in the repository', async () => {
    expect.assertions(2);

    const reason = "Fatal: your current branch 'master' does not have any commits yet";

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command === 'git log') {
        throw new Error(reason);
      }
    });

    await expect(check()).rejects.toThrow(reason);

    expect(exec).toBeCalledWith('git', ['log']);
  });

  test('rejecting with an error if the git working directory is not clean', async () => {
    expect.assertions(2);

    exec.mockImplementation(async (file, args) => {
      const command = [file, ...args].join(' ');

      if (command === 'git status --porcelain') {
        return 'M index.js';
      }
    });

    const reason = 'Working directory is not clean, please stage and commit before use';

    await expect(check()).rejects.toThrow(reason);

    expect(exec).toBeCalledWith('git', ['status', '--porcelain']);
  });
});