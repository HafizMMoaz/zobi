import isDashboardEmpty from 'src/dashboard/util/isDashboardEmpty';
import getEmptyLayout from 'src/dashboard/util/getEmptyLayout';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('isDashboardEmpty', () => {
  const emptyLayout = getEmptyLayout();
  const testLayout: object = {
    ...emptyLayout,
    'MARKDOWN-IhTGLhyiTd': {
      children: [],
      id: 'MARKDOWN-IhTGLhyiTd',
      meta: { code: 'test me', height: 50, width: 4 },
      parents: ['ROOT_ID', 'GRID_ID', 'ROW-uPjcKNYJQy'],
      type: 'MARKDOWN',
    },
  };

  test('should return true for empty dashboard', () => {
    expect(isDashboardEmpty(emptyLayout)).toBe(true);
  });

  test('should return false for non-empty dashboard', () => {
    expect(isDashboardEmpty(testLayout)).toBe(false);
  });
});
