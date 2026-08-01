
import { getColumnKeywords } from './getColumnKeywords';

test('returns HTML for a column tooltip', () => {
  const expected = {
    column_name: 'test column1',
    verbose_name: null,
    is_certified: false,
    certified_by: null,
    description: 'test description',
    type: 'VARCHAR',
  };
  expect(getColumnKeywords([expected])).toContainEqual({
    name: expected.column_name,
    value: expected.column_name,
    documentation: expect.stringContaining(expected.description),
    score: 50,
    meta: 'column',
  });
});
