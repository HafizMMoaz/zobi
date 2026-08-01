import { ValueGetterParams } from '@zobi.dev/core/components/ThemedAgGridReact';
import htmlTextFilterValueGetter, {
  htmlTextComparator,
} from './htmlTextFilterValueGetter';

const makeParams = (value: unknown): ValueGetterParams =>
  ({
    data: { foo: value },
    colDef: { field: 'foo' },
  }) as unknown as ValueGetterParams;

test('htmlTextFilterValueGetter extracts visible text from HTML anchor', () => {
  expect(
    htmlTextFilterValueGetter(
      makeParams(
        '<a href="https://jira.example.com/123/S18_3232">S18_3232</a>',
      ),
    ),
  ).toBe('S18_3232');
});

test('htmlTextFilterValueGetter strips nested HTML markup', () => {
  expect(
    htmlTextFilterValueGetter(
      makeParams('<div><strong>Hello</strong> <em>World</em></div>'),
    ),
  ).toBe('Hello World');
});

test('htmlTextFilterValueGetter passes plain strings through', () => {
  expect(htmlTextFilterValueGetter(makeParams('plain value'))).toBe(
    'plain value',
  );
});

test('htmlTextFilterValueGetter passes non-string values through', () => {
  expect(htmlTextFilterValueGetter(makeParams(42))).toBe(42);
  expect(htmlTextFilterValueGetter(makeParams(null))).toBeNull();
  expect(htmlTextFilterValueGetter(makeParams(undefined))).toBeUndefined();
});

test('htmlTextComparator orders by visible text, not raw HTML', () => {
  // URL prefixes (zzz vs bbb) would flip the order under raw-HTML sort,
  // but the visible labels (S700_4002 vs S72_3212) sort the other way.
  const left = '<a href="https://jira.example.com/zzz/S700_4002">S700_4002</a>';
  const right = '<a href="https://jira.example.com/bbb/S72_3212">S72_3212</a>';
  expect(htmlTextComparator(left, right)).toBeLessThan(0);
});

test('htmlTextComparator handles nulls and numbers', () => {
  expect(htmlTextComparator(null, null)).toBe(0);
  expect(htmlTextComparator(null, 'x')).toBeLessThan(0);
  expect(htmlTextComparator('x', null)).toBeGreaterThan(0);
  expect(htmlTextComparator(1, 2)).toBeLessThan(0);
  expect(htmlTextComparator(2, 1)).toBeGreaterThan(0);
});

test('htmlTextComparator preserves default codepoint ordering for plain strings', () => {
  // AG Grid's default string comparator orders by codepoint, so 'Z' (90)
  // sorts before 'a' (97). A locale-aware comparator would flip this —
  // verify we match the default so plain string columns are unaffected.
  expect(htmlTextComparator('Z', 'a')).toBeLessThan(0);
  expect(htmlTextComparator('a', 'Z')).toBeGreaterThan(0);
  expect(htmlTextComparator('apple', 'banana')).toBeLessThan(0);
});
