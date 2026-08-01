import { isCustomControlItem } from '@zobi-ui/chart-controls';
import controlPanel from '../src/plugin/controlPanel';
import React, { ReactElement } from 'react';

const isNameControl = (
  item: unknown,
  name: string,
): item is ReactElement<{ name: string }> =>
  React.isValidElement<{ name: string }>(item) && item.props.name === name;

test('control panel has rotation and color_scheme controls', () => {
  const optionsSection = controlPanel.controlPanelSections.find(
    (section): section is NonNullable<typeof section> =>
      Boolean(section && section.label === 'Options'),
  );
  expect(optionsSection).toBeDefined();
  if (!optionsSection) {
    throw new Error('Options section missing');
  }

  const rotationRow = optionsSection.controlSetRows.find(row =>
    row.some(item => isNameControl(item, 'rotation')),
  );
  expect(rotationRow).toBeDefined();

  const colorSchemeRow = optionsSection.controlSetRows.find(row =>
    row.some(item => isNameControl(item, 'color_scheme')),
  );
  expect(colorSchemeRow).toBeDefined();
});

test('sort_by_series defaults to true to preserve legacy ordering', () => {
  const querySection = controlPanel.controlPanelSections.find(
    (section): section is NonNullable<typeof section> =>
      Boolean(section && section.label === 'Query'),
  );
  expect(querySection).toBeDefined();
  if (!querySection) {
    throw new Error('Query section missing');
  }

  const sortBySeriesEntry = querySection.controlSetRows
    .flat()
    .find(item => isCustomControlItem(item) && item.name === 'sort_by_series');

  expect(isCustomControlItem(sortBySeriesEntry)).toBe(true);
  if (!isCustomControlItem(sortBySeriesEntry)) {
    throw new Error('sort_by_series control missing');
  }
  expect(sortBySeriesEntry.config.default).toBe(true);
});
