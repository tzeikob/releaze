const gitlog = require('../lib/gitlog');

describe('gitlog/errors', () => {
  test('should throw an error when `from` argument is an integer value', async () => {
    expect.assertions(2);

    try {
      await gitlog(123);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'Invalid from range argument: 123');
    }
  });

  test('should throw an error when `to` argument is an integer value', async () => {
    expect.assertions(2);

    try {
      await gitlog(null, 19);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'Invalid to range argument: 19');
    }
  });

  test('should throw an error when both `from` and `to` arguments are integers', async () => {
    expect.assertions(2);

    try {
      await gitlog(123, 456);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'Invalid from range argument: 123');
    }
  });
});