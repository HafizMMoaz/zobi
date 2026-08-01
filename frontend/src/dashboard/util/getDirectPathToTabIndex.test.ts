import getDirectPathToTabIndex from './getDirectPathToTabIndex';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getDirectPathToTabIndex', () => {
  test('builds path using parents, id, and child at index', () => {
    const tabs = {
      id: 'TABS_ID',
      parents: ['ROOT', 'ROW_1'],
      children: ['TAB_A', 'TAB_B', 'TAB_C'],
    };
    expect(getDirectPathToTabIndex(tabs, 1)).toEqual([
      'ROOT',
      'ROW_1',
      'TABS_ID',
      'TAB_B',
    ]);
  });

  test('handles missing parents', () => {
    const tabs = {
      id: 'TABS_ID',
      children: ['TAB_A'],
    };
    expect(getDirectPathToTabIndex(tabs, 0)).toEqual(['TABS_ID', 'TAB_A']);
  });
});
