
/* istanbul ignore next */
const console =
  typeof window !== 'undefined' ? window.console || {} : globalThis.console;
const log = console.log || (() => {});

const logger = {
  log,
  debug: console.debug || log,
  info: console.info || log,
  warn: console.warn || log,
  error: console.error || log,
  trace: console.trace || log,
  table: console.table || log,
};

/**
 * Zobi logger, currently just an alias to console.
 * This may be extended to support numerous console operations safely
 * i.e.: https://developer.mozilla.org/en-US/docs/Web/API/Console
 */
export default logger;
