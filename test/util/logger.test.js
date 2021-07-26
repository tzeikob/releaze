"use strict";

const chalk = require('chalk');
const logger = require('../../lib/util/logger');

jest.mock('chalk', () => ({
  green: jest.fn()
}));

console = {
  log: jest.fn(),
  error: jest.fn()
};

const { any } = expect;

beforeEach(() => {
  chalk.green.mockImplementation((value) => value);
});

afterEach(() => {
  chalk.green.mockReset();

  console.log.mockReset();
  console.error.mockReset();
});

describe('Logger should be an object exposing', () => {
  test('an info instance method', () => {
    expect.assertions(1);

    expect(logger).toMatchObject({
      info: any(Function)
    });
  });

  test('a success instance method', () => {
    expect.assertions(1);

    expect(logger).toMatchObject({
      success: any(Function)
    });
  });

  test('an error instance method', () => {
    expect.assertions(1);

    expect(logger).toMatchObject({
      error: any(Function)
    });
  });
});

describe('Info method should', () => {
  test('support multiple arguments and return always undefined', () => {
    expect.assertions(3);

    expect(logger.info()).toBeUndefined();
    expect(logger.info('a')).toBeUndefined();
    expect(logger.info('a', 'b', 'c')).toBeUndefined();
  });

  test('call once the `console.log` along with the given arguments', () => {
    expect.assertions(2);

    logger.info('a', 'b', 'c');

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('a', 'b', 'c');
  });
});

describe('Success method should', () => {
  test('support multiple arguments and return always undefined', () => {
    expect.assertions(3);

    expect(logger.success()).toBeUndefined();
    expect(logger.success('a')).toBeUndefined();
    expect(logger.success('a', 'b', 'c')).toBeUndefined();
  });

  test('call once the `console.log` along with the given args prefixed with a green check (\u2713) char', () => {
    expect.assertions(4);

    logger.success('Operation is completed successfully', 'b', 'c');

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('\u2713 Operation is completed successfully', 'b', 'c');

    expect(chalk.green).toBeCalledTimes(1);
    expect(chalk.green).toBeCalledWith('\u2713');
  });
});

describe('Error method should', () => {
  test('support multiple arguments and return always undefined', () => {
    expect.assertions(3);

    expect(logger.error()).toBeUndefined();
    expect(logger.error('a')).toBeUndefined();
    expect(logger.error('a', 'b', 'c')).toBeUndefined();
  });

  test('call once the `console.error` along with the given arguments', () => {
    expect.assertions(2);

    logger.error('a', 'b', 'c');

    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith('a', 'b', 'c');
  });
});