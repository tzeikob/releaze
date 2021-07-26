"use strict";

const logger = require('../../lib/util/logger');

console = {
  log: jest.fn(),
  error: jest.fn()
};

const { any } = expect;

afterEach(() => {
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