'use strict';

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
  test('expect a message argument returning always undefined', () => {
    expect.assertions(2);

    expect(logger.info()).toBeUndefined();
    expect(logger.info('Hello world')).toBeUndefined();
  });

  test('call once the `console.log` along with the given message argument', () => {
    expect.assertions(2);

    logger.info('Hello world');

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('Hello world');
  });

  test('indents the given message arg by the indentation size argument', () => {
    expect.assertions(2);

    logger.info('Hello world', 2);

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('  Hello world');
  });

  test('reject if not positive indentation size arg is given', () => {
    expect.assertions(2);

    expect(() => logger.info('Hello world', -2)).toThrow(Error);

    expect(console.log).not.toBeCalledTimes(1);
  });
});

describe('Success method should', () => {
  test('expect a message argument returning always undefined', () => {
    expect.assertions(2);

    expect(logger.success()).toBeUndefined();
    expect(logger.success('Hello world')).toBeUndefined();
  });

  test('call once the `console.log` along with the given message prefixed with a green check (\u2713) char', () => {
    expect.assertions(4);

    logger.success('Hello world');

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('\u2713 Hello world');

    expect(chalk.green).toBeCalledTimes(1);
    expect(chalk.green).toBeCalledWith('\u2713');
  });

  test('indents the given message arg by the indentation argument', () => {
    expect.assertions(2);

    logger.success('Hello world', 2);

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('  \u2713 Hello world');
  });

  test('reject if not positive indentation is given', () => {
    expect.assertions(3);

    expect(() => logger.success('Hello world', -2)).toThrow(Error);

    expect(console.log).not.toBeCalledTimes(1);
    expect(chalk.green).not.toBeCalledTimes(1);
  });
});

describe('Error method should', () => {
  test('expect a message argument returning always undefined', () => {
    expect.assertions(2);

    expect(logger.error()).toBeUndefined();
    expect(logger.error('Hello world')).toBeUndefined();
  });

  test('call once the `console.error` along with the given message argument', () => {
    expect.assertions(2);

    logger.error('Hello world');

    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith('Hello world');
  });
});