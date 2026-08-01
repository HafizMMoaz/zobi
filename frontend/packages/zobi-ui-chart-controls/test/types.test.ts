import { AdhocColumn } from '@zobi-ui/core';
import {
  ColumnMeta,
  ControlPanelSectionConfig,
  CustomControlItem,
  isColumnMeta,
  isControlPanelSectionConfig,
  isCustomControlItem,
  isSavedExpression,
} from '../src';

const ADHOC_COLUMN: AdhocColumn = {
  hasCustomLabel: true,
  label: 'Adhoc column',
  sqlExpression: 'case when 1 = 1 then 1 else 2 end',
  expressionType: 'SQL',
};
const COLUMN_META: ColumnMeta = {
  column_name: 'my_col',
};
const SAVED_EXPRESSION: ColumnMeta = {
  column_name: 'Saved expression',
  expression: 'case when 1 = 1 then 1 else 2 end',
};
const CONTROL_PANEL_SECTION_CONFIG: ControlPanelSectionConfig = {
  label: 'My Section',
  description: 'My Description',
  controlSetRows: [],
};
const CUSTOM_CONTROL_ITEM: CustomControlItem = {
  name: 'Custom Control Item',
  config: {
    type: 'config',
    foo: 'bar',
  },
};

test('isColumnMeta returns false for AdhocColumn', () => {
  expect(isColumnMeta(ADHOC_COLUMN)).toEqual(false);
});

test('isColumnMeta returns true for ColumnMeta', () => {
  expect(isColumnMeta(COLUMN_META)).toEqual(true);
});

test('isSavedExpression returns false for AdhocColumn', () => {
  expect(isSavedExpression(ADHOC_COLUMN)).toEqual(false);
});

test('isSavedExpression returns false for ColumnMeta without expression', () => {
  expect(isSavedExpression(COLUMN_META)).toEqual(false);
});

test('isSavedExpression returns true for ColumnMeta with expression', () => {
  expect(isSavedExpression(SAVED_EXPRESSION)).toEqual(true);
});

test('isControlPanelSectionConfig returns true for section', () => {
  expect(isControlPanelSectionConfig(CONTROL_PANEL_SECTION_CONFIG)).toEqual(
    true,
  );
});

test('isControlPanelSectionConfig returns true for null value', () => {
  expect(isControlPanelSectionConfig(null)).toEqual(false);
});

test('isCustomControlItem returns true for proper CustomControlItem', () => {
  expect(isCustomControlItem(CUSTOM_CONTROL_ITEM)).toEqual(true);
});

test('isCustomControlItem returns false for generic object', () => {
  expect(isCustomControlItem({})).toEqual(false);
});
