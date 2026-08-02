/**
 * A Stringify function that will not crash when it runs into circular JSON references,
 * unlike JSON.stringify. Circular references are replaced with a '[Circular]' string placeholder.
 * @param object any JSON object to be stringified
 */
export function safeStringify(object: any): string {
  const cache = new Set();
  return JSON.stringify(object, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        try {
          // Quick deep copy to duplicate if this is a repeat rather than a circle.
          return JSON.parse(JSON.stringify(value));
        } catch (err) {
          // Replace circular reference with a placeholder
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              `Circular reference detected and replaced with '[Circular]' placeholder (key: "${key}")`,
            );
          }
          return '[Circular]';
        }
      }
      cache.add(value);
    }
    return value;
  });
}
