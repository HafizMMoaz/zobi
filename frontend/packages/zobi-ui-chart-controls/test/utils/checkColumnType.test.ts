import { testQueryResponse } from '@zobi-ui/core';
import { GenericDataType } from '@zobi/core/common';
import { checkColumnType, TestDataset } from '../../src';

test('checkColumnType columns from a Dataset', () => {
  expect(
    checkColumnType('num', TestDataset, [GenericDataType.Numeric]),
  ).toEqual(true);
  expect(checkColumnType('num', TestDataset, [GenericDataType.String])).toEqual(
    false,
  );
  expect(
    checkColumnType('gender', TestDataset, [GenericDataType.String]),
  ).toEqual(true);
  expect(
    checkColumnType('gender', TestDataset, [GenericDataType.Numeric]),
  ).toEqual(false);
});

test('checkColumnType from a QueryResponse', () => {
  expect(
    checkColumnType('Column 1', testQueryResponse, [GenericDataType.String]),
  ).toEqual(true);
  expect(
    checkColumnType('Column 1', testQueryResponse, [GenericDataType.Numeric]),
  ).toEqual(false);
});

test('checkColumnType from null', () => {
  expect(checkColumnType('col', null, [])).toEqual(false);
});
