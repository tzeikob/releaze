'use strict';

const logger = require('../../lib/util/logger');

console = {
  log: jest.fn(),
  error: jest.fn()
};

const { any, stringMatching } = expect;

afterEach(() => {
  logger.level = 'INFO';

  console.log.mockReset();
  console.error.mockReset();
});

describe('Logger should be an object exposing', () => {
  test('a `level` instance property set to the default `INFO` logging level', () => {
    expect.assertions(2);

    expect(logger).toMatchObject({
      level: stringMatching(/DEBUG|VERBOSE|INFO|SUCCESS|ERROR/)
    });

    expect(logger.level).toBe('INFO');
  });

  test('the `debug`, `verbose`, `info`, `success` and `error` instance methods', () => {
    expect.assertions(1);

    expect(logger).toMatchObject({
      debug: any(Function),
      verbose: any(Function),
      info: any(Function),
      success: any(Function),
      error: any(Function)
    });
  });
});

describe('Method `debug` for a logging level set to', () => {
  test.each([
    'DEBUG'
  ])('%s, should log once via the `console.log` the message passed as arg', (level) => {
    expect.assertions(4);

    logger.level = level;

    expect(logger.debug('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('Hello world');

    expect(console.error).toBeCalledTimes(0);
  });

  test.each([
    'VERBOSE', 'INFO', 'SUCCESS', 'ERROR', 'OTHER'
  ])('%s, should skip logging', (level) => {
    expect.assertions(3);

    logger.level = level;

    expect(logger.debug('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });
});

describe('Method `verbose` for a logging level set to', () => {
  test.each([
    'DEBUG', 'VERBOSE'
  ])('%s, should log once via the `console.log` the message passed as arg', (level) => {
    expect.assertions(4);

    logger.level = level;

    expect(logger.verbose('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('Hello world');

    expect(console.error).toBeCalledTimes(0);
  });

  test.each([
    'INFO', 'SUCCESS', 'ERROR', 'OTHER'
  ])('%s, should skip logging', (level) => {
    expect.assertions(3);

    logger.level = level;

    expect(logger.verbose('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });
});

describe('Method `info` for a logging level set to', () => {
  test.each([
    'DEBUG', 'VERBOSE', 'INFO'
  ])('%s, should log once via the `console.log` the message passed as arg', (level) => {
    expect.assertions(4);

    logger.level = level;

    expect(logger.info('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('Hello world');

    expect(console.error).toBeCalledTimes(0);
  });

  test.each([
    'SUCCESS', 'ERROR', 'OTHER'
  ])('%s, should skip logging', (level) => {
    expect.assertions(3);

    logger.level = level;

    expect(logger.info('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });
});

describe('Method `success` for a logging level set to', () => {
  test.each([
    'DEBUG', 'VERBOSE', 'INFO', 'SUCCESS'
  ])('%s, should log once via the `console.log` the message passed as arg', (level) => {
    expect.assertions(4);

    logger.level = level;

    expect(logger.success('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith('\x1B[32m\u2713\x1B[39m Hello world');

    expect(console.error).toBeCalledTimes(0);
  });

  test.each([
    'ERROR', 'OTHER'
  ])('%s, should skip logging', (level) => {
    expect.assertions(3);

    logger.level = level;

    expect(logger.success('Hello world')).toBeUndefined();

    expect(console.log).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });
});

describe('Method `error` for a logging level set to', () => {
  test.each([
    'DEBUG', 'VERBOSE', 'INFO', 'SUCCESS', 'ERROR'
  ])('%s, should log once via the `console.error` the message passed as arg', (level) => {
    expect.assertions(4);

    logger.level = level;

    expect(logger.error('Hello world')).toBeUndefined();

    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith('Hello world');

    expect(console.log).toBeCalledTimes(0);
  });

  test.each([
    'OTHER'
  ])('%s, should skip logging', (level) => {
    expect.assertions(3);

    logger.level = level;

    expect(logger.error('Hello world')).toBeUndefined();

    expect(console.error).toBeCalledTimes(0);
    expect(console.log).toBeCalledTimes(0);
  });
});