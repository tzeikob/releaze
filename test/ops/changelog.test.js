'use strict';

const fs = require('fs');
const moment = require('moment');
const changelog = require('../../lib/ops/changelog');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const { readFile, writeFile } = fs.promises;
const { any } = expect;

beforeEach(() => {
  readFile.mockResolvedValue();
  writeFile.mockResolvedValue();
});

afterEach(() => {
  readFile.mockReset();
  writeFile.mockReset();
});

describe('Changelog should be an async operation', () => {
  test('getting as input a version and a logs args', async () => {
    expect.assertions(1);

    await expect(changelog('v1.0.0', ['log1', 'log2', 'log3'])).resolves.toBeDefined();
  });

  test('where version arg should always be given and be a string', async () => {
    expect.assertions(5);

    const reason = 'Invalid or missing version argument';

    await expect(changelog()).rejects.toThrow(reason);
    await expect(changelog(null)).rejects.toThrow(reason);
    await expect(changelog(123)).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('where logs arg should always be given and be an array', async () => {
    expect.assertions(5);

    const reason = 'Invalid or missing logs argument';

    await expect(changelog('v1.0.0')).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', null)).rejects.toThrow(reason);
    await expect(changelog('v1.0.0', 123)).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('resolving to an object', async () => {
    expect.assertions(1);

    await expect(changelog('v1.0.0', ['log1', 'log2'])).resolves.toMatchObject({
      filename: any(String),
      append: any(Boolean)
    });
  });
});

describe('Changelog called with valid version and logs args should', () => {
  test('create a new CHANGELOG.md file if not yet exists', async () => {
    expect.assertions(5);

    const error = new Error("ENOENT: no such file or directory, open 'CHANGELOG.md'");
    error.code = 'ENOENT';

    readFile.mockRejectedValue(error);

    await expect(changelog('v1.0.0', ['log1', 'log2'])).resolves.toEqual({
      filename: 'CHANGELOG.md',
      append: false
    });

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('CHANGELOG.md', 'utf8');

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith('CHANGELOG.md', expect.any(String));
  });

  test('append once to the existing CHANGELOG.md file if such already exists', async () => {
    expect.assertions(5);

    readFile.mockResolvedValue('log1');

    await expect(changelog('v1.0.0', ['log2', 'log3'])).resolves.toEqual({
      filename: 'CHANGELOG.md',
      append: true
    });

    expect(readFile).toBeCalledTimes(1);
    expect(readFile).toBeCalledWith('CHANGELOG.md', 'utf8');

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith('CHANGELOG.md', expect.any(String));
  });

  test('write the logs to a new CHANGELOG.md in the correct format', async () => {
    expect.assertions(3);

    const error = new Error("ENOENT: no such file or directory, open 'CHANGELOG.md'");
    error.code = 'ENOENT';

    readFile.mockRejectedValue(error);

    const logs = [
      '54ff0cd Restrict bump release types to lowercase only',
      'd41ab22 Accept alias HEAD as input to the log op'
    ];

    await expect(changelog('v2.0.0', logs)).resolves.toEqual({
      filename: 'CHANGELOG.md',
      append: false
    });

    const content = [
      `v2.0.0 - ${moment().format('MMMM D, YYYY')}\n\n`,
      '* 54ff0cd Restrict bump release types to lowercase only\n',
      '* d41ab22 Accept alias HEAD as input to the log op\n'
    ].join('');

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith('CHANGELOG.md', `${content}`);
  });

  test('write an empty release head to a new CHANGELOG.md when an empty array of logs is given', async () => {
    expect.assertions(3);

    const error = new Error("ENOENT: no such file or directory, open 'CHANGELOG.md'");
    error.code = 'ENOENT';

    readFile.mockRejectedValue(error);

    await expect(changelog('v2.0.0', [])).resolves.toEqual({
      filename: 'CHANGELOG.md',
      append: false
    });

    const content = `v2.0.0 - ${moment().format('MMMM D, YYYY')}\n`;

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith('CHANGELOG.md', `${content}`);
  });

  test('append the logs on top of an existing CHANGELOG.md in the correct format', async () => {
    expect.assertions(3);

    const oldContent = [
      `v1.5.2 - ${moment().format('MMMM D, YYYY')}\n\n`,
      '* 81ad3fb Refactor log tests to assert every await call\n',
      '* 3b5b25f Refactor log tests to assert with toThrow instead\n'
    ].join('');

    readFile.mockResolvedValue(oldContent);

    const logs = [
      '54ff0cd Restrict bump release types to lowercase only',
      'd41ab22 Accept alias HEAD as input to the log op'
    ];

    await expect(changelog('v2.0.0', logs)).resolves.toEqual({
      filename: 'CHANGELOG.md',
      append: true
    });

    const newContent = [
      `v2.0.0 - ${moment().format('MMMM D, YYYY')}\n\n`,
      '* 54ff0cd Restrict bump release types to lowercase only\n',
      '* d41ab22 Accept alias HEAD as input to the log op\n'
    ].join('');

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith('CHANGELOG.md', `${newContent}\n${oldContent}`);
  });

  test('append just an empty release head when an empty array of logs is given', async () => {
    expect.assertions(3);

    const oldContent = [
      `v1.5.2 - ${moment().format('MMMM D, YYYY')}\n\n`,
      '* 81ad3fb Refactor log tests to assert every await call\n',
      '* 3b5b25f Refactor log tests to assert with toThrow instead\n'
    ].join('');

    readFile.mockResolvedValue(oldContent);

    await expect(changelog('v2.0.0', [])).resolves.toEqual({
      filename: 'CHANGELOG.md',
      append: true
    });

    const newContent = `v2.0.0 - ${moment().format('MMMM D, YYYY')}\n`;

    expect(writeFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledWith('CHANGELOG.md', `${newContent}\n${oldContent}`);
  });
});

describe('Changelog should reject with an error', () => {
  test('when reading from CHANGELOG.md failed with a fatal reason', async () => {
    expect.assertions(1);

    const reason = 'A fatal error occurred reading from: CHANGELOG.md';

    readFile.mockRejectedValue(new Error(reason));

    await expect(changelog('v1.0.0', ['log1', 'log2'])).rejects.toThrow(reason);
  });
});