import { getComparisonFontSize, getHeaderFontSize } from './utils';

test('getHeaderFontSize', () => {
  expect(getHeaderFontSize(0.2)).toEqual(16);
  expect(getHeaderFontSize(0.3)).toEqual(20);
  expect(getHeaderFontSize(0.4)).toEqual(30);
  expect(getHeaderFontSize(0.5)).toEqual(48);
  expect(getHeaderFontSize(0.6)).toEqual(60);
  expect(getHeaderFontSize(0.15)).toEqual(60);
  expect(getHeaderFontSize(2)).toEqual(60);
});

test('getComparisonFontSize', () => {
  expect(getComparisonFontSize(0.125)).toEqual(16);
  expect(getComparisonFontSize(0.15)).toEqual(20);
  expect(getComparisonFontSize(0.2)).toEqual(26);
  expect(getComparisonFontSize(0.3)).toEqual(32);
  expect(getComparisonFontSize(0.4)).toEqual(40);
  expect(getComparisonFontSize(0.05)).toEqual(40);
  expect(getComparisonFontSize(0.9)).toEqual(40);
});
