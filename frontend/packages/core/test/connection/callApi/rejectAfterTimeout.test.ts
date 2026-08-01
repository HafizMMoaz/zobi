import rejectAfterTimeout from '../../../src/connection/callApi/rejectAfterTimeout';

describe('rejectAfterTimeout()', () => {
  test('returns a promise that rejects after the specified timeout', async () => {
    expect.assertions(1);
    jest.useFakeTimers();
    let error;

    try {
      const promise = rejectAfterTimeout(10);
      jest.advanceTimersByTime(11);
      await promise;
    } catch (err) {
      error = err;
    } finally {
      expect(error).toBeDefined();
    }
    jest.useRealTimers();
  });
});
