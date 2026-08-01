export interface TabsComponentLike {
  id: string;
  parents?: string[];
  children: string[];
  [key: string]: unknown;
}

export default function getDirectPathToTabIndex(
  tabsComponent: TabsComponentLike,
  tabIndex: number,
): string[] {
  const directPathToFilter = (tabsComponent.parents || []).slice();
  directPathToFilter.push(tabsComponent.id);
  directPathToFilter.push(tabsComponent.children[tabIndex]);

  return directPathToFilter;
}
