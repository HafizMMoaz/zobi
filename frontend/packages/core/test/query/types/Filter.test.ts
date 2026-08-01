

import {
  isUnaryAdhocFilter,
  isBinaryAdhocFilter,
  isSetAdhocFilter,
  isFreeFormAdhocFilter,
} from '@zobi.dev/core';

describe('Filter type guards', () => {
  describe('isUnaryAdhocFilter', () => {
    test('should return true when it is the correct type', () => {
      expect(
        isUnaryAdhocFilter({
          expressionType: 'SIMPLE',
          clause: 'WHERE',
          subject: 'tea',
          operator: 'IS NOT NULL',
        }),
      ).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(
        isUnaryAdhocFilter({
          expressionType: 'SIMPLE',
          clause: 'WHERE',
          subject: 'tea',
          operator: '==',
          comparator: 'matcha',
        }),
      ).toEqual(false);
    });
  });

  describe('isBinaryAdhocFilter', () => {
    test('should return true when it is the correct type', () => {
      expect(
        isBinaryAdhocFilter({
          expressionType: 'SIMPLE',
          clause: 'WHERE',
          subject: 'tea',
          operator: '!=',
          comparator: 'matcha',
        }),
      ).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(
        isBinaryAdhocFilter({
          expressionType: 'SIMPLE',
          clause: 'WHERE',
          subject: 'tea',
          operator: 'IS NOT NULL',
        }),
      ).toEqual(false);
    });
  });

  describe('isSetAdhocFilter', () => {
    test('should return true when it is the correct type', () => {
      expect(
        isSetAdhocFilter({
          expressionType: 'SIMPLE',
          clause: 'WHERE',
          subject: 'tea',
          operator: 'IN',
          comparator: ['hojicha', 'earl grey'],
        }),
      ).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(
        isSetAdhocFilter({
          expressionType: 'SIMPLE',
          clause: 'WHERE',
          subject: 'tea',
          operator: 'IS NOT NULL',
        }),
      ).toEqual(false);
    });
  });
  describe('isFreeFormAdhocFilter', () => {
    test('should return true when it is the correct type', () => {
      expect(
        isFreeFormAdhocFilter({
          expressionType: 'SQL',
          clause: 'WHERE',
          sqlExpression: 'gender = "boy"',
        }),
      ).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(
        isFreeFormAdhocFilter({
          expressionType: 'SIMPLE',
          clause: 'WHERE',
          subject: 'tea',
          operator: '==',
          comparator: 'matcha',
        }),
      ).toEqual(false);
    });
  });
});
