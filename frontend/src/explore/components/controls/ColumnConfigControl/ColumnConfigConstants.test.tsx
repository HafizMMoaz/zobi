
import { SHARED_COLUMN_CONFIG_PROPS } from './constants';

test('should allow commas in D3 format inputs', () => {
  const { options } = SHARED_COLUMN_CONFIG_PROPS.d3NumberFormat;
  const labels = (options ?? []).map((option: { label: unknown }) =>
    String(option.label),
  );
  expect(labels.some((label: string) => label.includes(','))).toBe(true);
});

test('should use defaults from Select token separators', () => {
  expect(
    Object.prototype.hasOwnProperty.call(
      SHARED_COLUMN_CONFIG_PROPS.d3NumberFormat,
      'tokenSeparators',
    ),
  ).toBe(false);
});
