import { getColumnLabel } from '@zobi-ui/core';

describe('getColumnLabel', () => {
  test('should handle physical column', () => {
    expect(getColumnLabel('gender')).toEqual('gender');
  });

  test('should handle adhoc columns with label', () => {
    expect(
      getColumnLabel({
        sqlExpression: "case when 1 then 'a' else 'b' end",
        label: 'my col',
        expressionType: 'SQL',
      }),
    ).toEqual('my col');
  });

  test('should handle adhoc columns without label', () => {
    expect(
      getColumnLabel({
        sqlExpression: "case when 1 then 'a' else 'b' end",
        expressionType: 'SQL',
      }),
    ).toEqual("case when 1 then 'a' else 'b' end");
  });
});
