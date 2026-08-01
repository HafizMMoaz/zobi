import { applyOrderBy } from './orderby';

test('does not apply orderby for numeric zero row limit', () => {
  expect(applyOrderBy([['col', true]], 0)).toEqual({});
});

test('does not apply orderby for string zero row limit', () => {
  expect(applyOrderBy([['col', true]], '0')).toEqual({});
});

test('applies orderby for non-zero string row limit', () => {
  expect(applyOrderBy([['col', true]], '10')).toEqual({
    orderby: [['col', true]],
  });
});
