const bump = require('../lib/bump');

describe('Bump should reject with error', () => {
  test('when called with no release type argument', async () => {
    expect.assertions(2);

    await expect(bump()).rejects.toBeInstanceOf(Error);
    await expect(bump()).rejects.toHaveProperty('message', 'Invalid or missing semver release type argument');
  });
});