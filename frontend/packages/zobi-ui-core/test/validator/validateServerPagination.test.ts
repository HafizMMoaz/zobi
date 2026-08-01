
import { validateServerPagination } from '@zobi-ui/core';
import './setup';

const DEFAULT_MAX_ROW = 100000;
const DEFAULT_MAX_ROW_TABLE_SERVER = 500000;

test('validateServerPagination returns warning message only when value is between max thresholds and server pagination is disabled', () => {
  // Should show warning - value between thresholds and server pagination disabled
  expect(
    validateServerPagination(
      200000,
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeTruthy();
  expect(
    validateServerPagination(
      300000,
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeTruthy();

  // Should not show warning - value above max server threshold
  expect(
    validateServerPagination(
      600000,
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();

  // Should not show warning - value below max without server threshold
  expect(
    validateServerPagination(
      50000,
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
});

test('validateServerPagination returns false when server pagination is enabled regardless of value', () => {
  expect(
    validateServerPagination(
      200000,
      true,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
  expect(
    validateServerPagination(
      300000,
      true,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
  expect(
    validateServerPagination(
      600000,
      true,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
});

test('validateServerPagination handles string inputs correctly', () => {
  expect(
    validateServerPagination(
      '200000',
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeTruthy();
  expect(
    validateServerPagination(
      '600000',
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
  expect(
    validateServerPagination(
      '50000',
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
});

test('validateServerPagination handles edge cases', () => {
  expect(
    validateServerPagination(
      undefined,
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
  expect(
    validateServerPagination(
      null,
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
  expect(
    validateServerPagination(
      NaN,
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
  expect(
    validateServerPagination(
      'invalid',
      false,
      DEFAULT_MAX_ROW,
      DEFAULT_MAX_ROW_TABLE_SERVER,
    ),
  ).toBeFalsy();
});
