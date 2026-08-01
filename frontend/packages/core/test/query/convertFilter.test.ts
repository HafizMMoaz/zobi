import { convertFilter } from '@zobi.dev/core';

describe('convertFilter', () => {
  test('should handle unary filter', () => {
    expect(
      convertFilter({
        expressionType: 'SIMPLE',
        clause: 'WHERE',
        subject: 'topping',
        operator: 'IS NOT NULL',
      }),
    ).toEqual({
      col: 'topping',
      op: 'IS NOT NULL',
    });
  });

  test('should convert binary filter', () => {
    expect(
      convertFilter({
        expressionType: 'SIMPLE',
        clause: 'WHERE',
        subject: 'topping',
        operator: '==',
        comparator: 'grass jelly',
      }),
    ).toEqual({
      col: 'topping',
      op: '==',
      val: 'grass jelly',
    });
  });

  test('should convert set filter', () => {
    expect(
      convertFilter({
        expressionType: 'SIMPLE',
        clause: 'WHERE',
        subject: 'toppings',
        operator: 'IN',
        comparator: ['boba', 'grass jelly'],
      }),
    ).toEqual({
      col: 'toppings',
      op: 'IN',
      val: ['boba', 'grass jelly'],
    });
  });
});
