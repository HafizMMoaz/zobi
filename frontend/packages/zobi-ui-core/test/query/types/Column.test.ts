import {
  isAdhocColumn,
  isAdhocColumnReference,
  isPhysicalColumn,
  isQueryFormColumn,
} from '@zobi-ui/core';

const adhocColumn = {
  expressionType: 'SQL',
  label: 'country',
  optionName: 'country',
  sqlExpression: 'country',
};

test('isPhysicalColumn returns true', () => {
  expect(isPhysicalColumn('gender')).toEqual(true);
});

test('isPhysicalColumn returns false', () => {
  expect(isPhysicalColumn(adhocColumn)).toEqual(false);
});

test('isAdhocColumn returns true', () => {
  expect(isAdhocColumn(adhocColumn)).toEqual(true);
});

test('isAdhocColumn returns false', () => {
  expect(isAdhocColumn('hello')).toEqual(false);
  expect(isAdhocColumn({})).toEqual(false);
  expect(
    isAdhocColumn({
      expressionType: 'SQL',
      label: 'country',
      optionName: 'country',
    }),
  ).toEqual(false);
});

test('isQueryFormColumn returns true', () => {
  expect(isQueryFormColumn('gender')).toEqual(true);
  expect(isQueryFormColumn(adhocColumn)).toEqual(true);
});

test('isQueryFormColumn returns false', () => {
  expect(isQueryFormColumn({})).toEqual(false);
});

test('isAdhocColumnReference returns true for adhoc column with isColumnReference', () => {
  const ref = { ...adhocColumn, isColumnReference: true };
  expect(isAdhocColumnReference(ref)).toEqual(true);
});

test('isAdhocColumnReference returns false for non-reference adhoc column', () => {
  expect(isAdhocColumnReference(adhocColumn)).toEqual(false);
});

test('isAdhocColumnReference returns false for non-adhoc column', () => {
  expect(isAdhocColumnReference('gender')).toEqual(false);
});
