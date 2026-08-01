import { LabeledValue as AntdLabeledValue } from 'antd/es/select';
import { t } from '@zobi/core-legacy/translation';
import { rankedSearchCompare } from '../../utils/rankedSearchCompare';
import { RawValue, SelectProps } from './types';

export const MAX_TAG_COUNT = 4;

export const TOKEN_SEPARATORS = [',', '\r\n', '\n', '\t', ';'];

export const EMPTY_OPTIONS = [];

export const DEFAULT_PAGE_SIZE = 100;

export const SELECT_ALL_VALUE: RawValue = t('Select All');

export const VIRTUAL_THRESHOLD = 20;

export const DROPDOWN_ALIGN_BOTTOM: SelectProps['dropdownAlign'] = {
  points: ['tl', 'bl'],
  offset: [0, 4],
  overflow: { adjustX: 0, adjustY: 1 },
};

export const SELECT_ALL_OPTION = {
  value: SELECT_ALL_VALUE,
  label: String(SELECT_ALL_VALUE),
};

export const DEFAULT_SORT_COMPARATOR = (
  a: AntdLabeledValue,
  b: AntdLabeledValue,
  search?: string,
) => {
  let aText: string | undefined;
  let bText: string | undefined;
  if (typeof a.label === 'string' && typeof b.label === 'string') {
    aText = a.label;
    bText = b.label;
  } else if (typeof a.value === 'string' && typeof b.value === 'string') {
    aText = a.value;
    bText = b.value;
  }
  // sort selected options first
  if (typeof aText === 'string' && typeof bText === 'string') {
    if (search) {
      return rankedSearchCompare(aText, bText, search);
    }
    return aText.localeCompare(bText);
  }
  return (a.value as number) - (b.value as number);
};
