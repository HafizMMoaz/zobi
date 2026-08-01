beforeEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
});

test('should pipe to `console` methods', () => {
  const { logging } = require('@zobi/core/utils');

  jest.spyOn(logging, 'debug').mockImplementation();
  jest.spyOn(logging, 'log').mockImplementation();
  jest.spyOn(logging, 'info').mockImplementation();
  expect(() => {
    logging.debug();
    logging.log();
    logging.info();
  }).not.toThrow();

  jest.spyOn(logging, 'warn').mockImplementation(() => {
    throw new Error('warn');
  });
  expect(() => logging.warn()).toThrow('warn');

  jest.spyOn(logging, 'error').mockImplementation(() => {
    throw new Error('error');
  });
  expect(() => logging.error()).toThrow('error');

  jest.spyOn(logging, 'trace').mockImplementation(() => {
    throw new Error('Trace:');
  });
  expect(() => logging.trace()).toThrow('Trace:');
});

test('should use noop functions when console unavailable', () => {
  Object.assign(window, { console: undefined });
  const { logging } = require('@zobi/core/utils');

  expect(() => {
    logging.debug();
    logging.log();
    logging.info();
    logging.warn('warn');
    logging.error('error');
    logging.trace();
    logging.table([
      [1, 2],
      [3, 4],
    ]);
  }).not.toThrow();
  Object.assign(window, { console });
});
