import isTruthy from '../../src/utils/isTruthy';

describe('isTruthy', () => {
  test('evals false-looking strings properly', () => {
    expect(isTruthy('f')).toBe(false);
    expect(isTruthy('false')).toBe(false);
    expect(isTruthy('no')).toBe(false);
    expect(isTruthy('n')).toBe(false);
    expect(isTruthy('F')).toBe(false);
    expect(isTruthy('False')).toBe(false);
    expect(isTruthy('NO')).toBe(false);
    expect(isTruthy('N')).toBe(false);
  });
  test('evals true-looking strings properly', () => {
    expect(isTruthy('t')).toBe(true);
    expect(isTruthy('true')).toBe(true);
    expect(isTruthy('yes')).toBe(true);
    expect(isTruthy('y')).toBe(true);
    expect(isTruthy('Y')).toBe(true);
    expect(isTruthy('True')).toBe(true);
    expect(isTruthy('Yes')).toBe(true);
    expect(isTruthy('YES')).toBe(true);
  });
  test('evals bools properly', () => {
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy(true)).toBe(true);
  });
  test('evals ints properly', () => {
    expect(isTruthy(0)).toBe(false);
    expect(isTruthy(1)).toBe(true);
  });
  test('evals constants properly', () => {
    expect(isTruthy(null)).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
  });
  test('string auto is false', () => {
    expect(isTruthy('false')).toBe(false);
  });
});
