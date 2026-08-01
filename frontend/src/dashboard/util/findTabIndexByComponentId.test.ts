import findTabIndexByComponentId from 'src/dashboard/util/findTabIndexByComponentId';
import { LayoutItem, LayoutItemMeta } from '../types';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('findTabIndexByComponentId', () => {
  const topLevelTabsComponent: LayoutItem = {
    children: ['TAB-0g-5l347I2', 'TAB-qrwN_9VB5'],
    id: 'TABS-MNQQSW-kyd',
    meta: {} as LayoutItemMeta,
    parents: ['ROOT_ID'],
    type: 'TABS',
  };
  const rowLevelTabsComponent: LayoutItem = {
    children: [
      'TAB-TwyUUGp2Bg',
      'TAB-Zl1BQAUvN',
      'TAB-P0DllxzTU',
      'TAB---e53RNei',
    ],
    id: 'TABS-Oduxop1L7I',
    meta: {} as LayoutItemMeta,
    parents: ['ROOT_ID', 'TABS-MNQQSW-kyd', 'TAB-qrwN_9VB5'],
    type: 'TABS',
  };
  const goodPathToChild = [
    'ROOT_ID',
    'TABS-MNQQSW-kyd',
    'TAB-qrwN_9VB5',
    'TABS-Oduxop1L7I',
    'TAB-P0DllxzTU',
    'ROW-JXhrFnVP8',
    'CHART-dUIVg-ENq6',
  ];
  const badPath = ['ROOT_ID', 'TABS-MNQQSW-kyd', 'TAB-ABC', 'TABS-Oduxop1L7I'];

  test('should return -1 if no directPathToChild', () => {
    expect(
      findTabIndexByComponentId({
        currentComponent: topLevelTabsComponent,
        directPathToChild: [],
      }),
    ).toBe(-1);
  });

  test('should return -1 if not found tab id', () => {
    expect(
      findTabIndexByComponentId({
        currentComponent: topLevelTabsComponent,
        directPathToChild: badPath,
      }),
    ).toBe(-1);
  });

  test('should return children index if matched an id in the path', () => {
    expect(
      findTabIndexByComponentId({
        currentComponent: topLevelTabsComponent,
        directPathToChild: goodPathToChild,
      }),
    ).toBe(1);

    expect(
      findTabIndexByComponentId({
        currentComponent: rowLevelTabsComponent,
        directPathToChild: goodPathToChild,
      }),
    ).toBe(2);
  });
});
