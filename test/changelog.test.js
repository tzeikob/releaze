const fs = require('fs');
const path = require('path');
const changelog = require('../lib/changelog');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
  }
}));

const { readFile, writeFile } = fs.promises;

const pathToChangelogMD = path.join(process.cwd(), 'CHANGELOG.md');

afterEach(() => {
  readFile.mockReset();
  writeFile.mockReset();
});

describe('Changelog should reject with an error', () => {
  test('when called with missing `version` argument', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing version argument';

    await expect(changelog()).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when called with invalid non-string `version` argument', async () => {
    expect.assertions(10);

    const reason = 'Invalid or missing version argument';

    await expect(changelog(123)).rejects.toThrow(reason);
    await expect(changelog(true)).rejects.toThrow(reason);
    await expect(changelog(false)).rejects.toThrow(reason);
    await expect(changelog('')).rejects.toThrow(reason);
    await expect(changelog({})).rejects.toThrow(reason);
    await expect(changelog(Symbol('s'))).rejects.toThrow(reason);
    await expect(changelog(() => {})).rejects.toThrow(reason);
    await expect(changelog(null)).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when called with no `logs` argument', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing logs argument';

    await expect(changelog('v1.0.0')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when called with invalid `logs` argument', async () => {
    expect.assertions(11);

    const reason = 'Invalid or missing logs argument';

    await expect(changelog('v1.0.0', 123)).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', true)).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', false)).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', '')).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', 'logs')).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', {})).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', Symbol('s'))).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', () => {})).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', null)).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when called with `logs` argument given as an empty array', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing logs argument';

    await expect(changelog('v1.0.0', [])).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when reading from `CHANGELOG.md` failed with a fatal reason', async () => {
    expect.assertions(1);

    const error = new Error('Unknown fatal error occurred reading from CHANGELOG.md');

    readFile.mockRejectedValue(error);

    await expect(changelog('v1.0.0', ['log1', 'log2'])).rejects.toThrow(error);
  });
});

describe('Changelog called with valid `version` and `logs` should', () => {
  test('create a new `CHANGELOG.md` file if not yet exists', async () => {
    expect.assertions(5);

    const error = new Error("ENOENT: no such file or directory, open 'CHANGELOG.md'");
    error.code = 'ENOENT';

    readFile.mockRejectedValue(error);
    writeFile.mockResolvedValue();

    await expect(changelog('v1.0.0', ['log1', 'log2'])).resolves.toBeUndefined();

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith(pathToChangelogMD, 'utf8');

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith(pathToChangelogMD, expect.any(String));
  });

  test('write once to the existing `CHANGELOG.md` file if such already exists', async () => {
    expect.assertions(5);
    
    readFile.mockResolvedValue('log1');
    writeFile.mockResolvedValue();

    await expect(changelog('v1.0.0', ['log2', 'log3'])).resolves.toBeUndefined();

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith(pathToChangelogMD, 'utf8');

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith(pathToChangelogMD, expect.any(String));
  });

  test('write the logs to a new `CHANGELOG.md` in the correct format', async () => {
    expect.assertions(3);

    const error = new Error("ENOENT: no such file or directory, open 'CHANGELOG.md'");
    error.code = 'ENOENT';

    readFile.mockRejectedValue(error);
    writeFile.mockResolvedValue();

    const logs = [
      '54ff0cd Restrict bump release types to lowercase only',
      'd41ab22 Accept alias HEAD as input to the log op'
    ];

    await expect(changelog('v2.0.0', logs)).resolves.toBeUndefined();

    const content = [
      '#v2.0.0',
      '* 54ff0cd Restrict bump release types to lowercase only',
      '* d41ab22 Accept alias HEAD as input to the log op'
    ].join('\n');

    expect(writeFile).toBeCalledWith(pathToChangelogMD, `${content}`);
    expect(writeFile).toBeCalledTimes(1);
  });

  test('append the logs on top of an existing `CHANGELOG.md` in the correct format', async () => {
    expect.assertions(3);

    oldContent = [
      '#v1.5.2',
      '* 81ad3fb Refactor log tests to assert every await call',
      '* 3b5b25f Refactor log tests to assert with toThrow instead'
    ].join('\n');

    readFile.mockResolvedValue(oldContent);
    writeFile.mockResolvedValue();

    const logs = [
      '54ff0cd Restrict bump release types to lowercase only',
      'd41ab22 Accept alias HEAD as input to the log op'
    ];

    await expect(changelog('v2.0.0', logs)).resolves.toBeUndefined();

    const newContent = [
      '#v2.0.0',
      '* 54ff0cd Restrict bump release types to lowercase only',
      '* d41ab22 Accept alias HEAD as input to the log op'
    ].join('\n');

    expect(writeFile).toBeCalledWith(pathToChangelogMD, `${newContent}\n${oldContent}`);
    expect(writeFile).toBeCalledTimes(1);
  });
});