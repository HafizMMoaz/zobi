import { cleanup } from '@zobi-ui/core/spec';
import { withinRange } from './utils';

// Add cleanup after each test
afterEach(async () => {
  cleanup();
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

// Make tests async
test('withinRange supported positive numbers', async () => {
  // Valid inputs within range
  expect(withinRange(50, 60, 16)).toBeTruthy();

  // Valid inputs outside of range
  expect(withinRange(40, 60, 16)).toBeFalsy();
});

test('withinRange unsupported negative numbers', async () => {
  // Negative numbers not supported
  expect(withinRange(65, 60, -16)).toBeFalsy();
  expect(withinRange(-60, -65, 16)).toBeFalsy();
  expect(withinRange(-60, -65, 16)).toBeFalsy();
  expect(withinRange(-60, 65, 16)).toBeFalsy();
});

test('withinRange invalid inputs', async () => {
  // Invalid inputs should return falsy and not throw an error
  // We need ts-ignore here to be able to pass invalid values and pass linting
  // @ts-expect-error
  expect(withinRange(null, 60, undefined)).toBeFalsy();
  // @ts-expect-error
  expect(withinRange([], 'hello', {})).toBeFalsy();
  // @ts-expect-error
  expect(withinRange([], undefined, {})).toBeFalsy();
  // @ts-expect-error
  expect(withinRange([], 'hello', {})).toBeFalsy();
});
