import { Comparator, ObjectFormattingEnum } from '@zobi-ui/chart-controls';
import { t } from '@zobi/core/translation';

export const operatorOptions = [
  { value: Comparator.None, label: t('None') },
  { value: Comparator.GreaterThan, label: '>' },
  { value: Comparator.LessThan, label: '<' },
  { value: Comparator.GreaterOrEqual, label: '≥' },
  { value: Comparator.LessOrEqual, label: '≤' },
  { value: Comparator.Equal, label: '=' },
  { value: Comparator.NotEqual, label: '≠' },
  { value: Comparator.Between, label: '< x <' },
  { value: Comparator.BetweenOrEqual, label: '≤ x ≤' },
  { value: Comparator.BetweenOrLeftEqual, label: '≤ x <' },
  { value: Comparator.BetweenOrRightEqual, label: '< x ≤' },
];

export const stringOperatorOptions = [
  { value: Comparator.None, label: t('None') },
  { value: Comparator.Equal, label: '=' },
  { value: Comparator.BeginsWith, label: t('begins with') },
  { value: Comparator.EndsWith, label: t('ends with') },
  { value: Comparator.Containing, label: t('containing') },
  { value: Comparator.NotContaining, label: t('not containing') },
];

export const booleanOperatorOptions = [
  { value: Comparator.IsNull, label: t('is null') },
  { value: Comparator.IsTrue, label: t('is true') },
  { value: Comparator.IsFalse, label: t('is false') },
  { value: Comparator.IsNotNull, label: t('is not null') },
];

export const formattingOptions = [
  {
    value: ObjectFormattingEnum.BACKGROUND_COLOR,
    label: t('background color'),
  },
  {
    value: ObjectFormattingEnum.TEXT_COLOR,
    label: t('text color'),
  },
  {
    value: ObjectFormattingEnum.CELL_BAR,
    label: t('cell bar'),
  },
];

// Use theme token names instead of hex values to support theme switching
export const colorSchemeOptions = () => [
  { value: 'colorSuccess', label: t('success') },
  { value: 'colorWarning', label: t('alert') },
  { value: 'colorError', label: t('error') },
];
