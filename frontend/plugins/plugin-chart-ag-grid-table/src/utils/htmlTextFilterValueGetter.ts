import { isProbablyHTML, sanitizeHtml } from '@zobi-ui/core';
import { ValueGetterParams } from '@zobi-ui/core/components/ThemedAgGridReact';

const stripHtmlToText = (html: string): string => {
  const doc = new DOMParser().parseFromString(sanitizeHtml(html), 'text/html');
  return (doc.body.textContent || '').trim();
};

// Cache the comparator-ready form per raw string. Both the HTML-detection
// step (`isProbablyHTML`, which itself invokes DOMParser for HTML-looking
// values) and the extraction step (`stripHtmlToText`, also DOMParser) are
// expensive; sort runs `O(n log n)` comparator calls against the same set
// of cell values. Memoizing the combined detection + extraction means each
// unique cell value pays the cost once per session. Module-level scope;
// bounded by the count of unique string cell values seen.
const comparableTextCache = new Map<string, string>();

const toComparableText = (raw: string): string => {
  const cached = comparableTextCache.get(raw);
  if (cached !== undefined) return cached;
  const normalized = isProbablyHTML(raw) ? stripHtmlToText(raw) : raw;
  comparableTextCache.set(raw, normalized);
  return normalized;
};

/**
 * Returns the visible-text representation of an HTML cell value so AG Grid
 * filters and sort operate on what the user sees, not the underlying markup.
 * Pass-through for non-HTML values.
 */
const htmlTextFilterValueGetter = (params: ValueGetterParams) => {
  const raw = params.data?.[params.colDef.field as string];
  return typeof raw === 'string' ? toComparableText(raw) : raw;
};

/**
 * Comparator that mirrors AG Grid's default string comparator (codepoint
 * order, nulls first), but extracts visible text from HTML values first
 * so HTML cells sort by their displayed label. Plain (non-HTML) values
 * pass through unchanged, preserving default ordering — e.g. 'Z' still
 * sorts before 'a' as it does under the default comparator.
 */
export const htmlTextComparator = (a: unknown, b: unknown): number => {
  const toText = (v: unknown) =>
    typeof v === 'string' ? toComparableText(v) : v;
  const aT = toText(a);
  const bT = toText(b);
  if (aT == null && bT == null) return 0;
  if (aT == null) return -1;
  if (bT == null) return 1;
  if (typeof aT === 'number' && typeof bT === 'number') return aT - bT;
  if (aT === bT) return 0;
  return aT < bT ? -1 : 1;
};

export default htmlTextFilterValueGetter;
