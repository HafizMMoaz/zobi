import {
  tokenizeToNumericArray,
  tokenizeToStringArray,
} from '../../src/utils/tokenize';

describe('tokenizeToNumericArray', () => {
  test('evals numeric strings properly', () => {
    expect(tokenizeToNumericArray('1')).toStrictEqual([1]);
    expect(tokenizeToNumericArray('1,2,3,4')).toStrictEqual([1, 2, 3, 4]);
    expect(tokenizeToNumericArray('1.1,2.2,3.0,4')).toStrictEqual([
      1.1, 2.2, 3, 4,
    ]);
    expect(tokenizeToNumericArray('   1, 2,   3,    4 ')).toStrictEqual([
      1, 2, 3, 4,
    ]);
  });

  test('evals undefined to null', () => {
    expect(tokenizeToNumericArray(undefined)).toBeNull();
  });

  test('evals empty strings to null', () => {
    expect(tokenizeToNumericArray('')).toBeNull();
    expect(tokenizeToNumericArray('    ')).toBeNull();
  });

  test('throws error on incorrect string', () => {
    expect(() => tokenizeToNumericArray('qwerty,1,2,3')).toThrow(Error);
  });
});

describe('tokenizeToStringArray', () => {
  test('evals numeric strings properly', () => {
    expect(tokenizeToStringArray('a')).toStrictEqual(['a']);
    expect(tokenizeToStringArray('1.1 , 2.2, 3.0 ,4')).toStrictEqual([
      '1.1',
      '2.2',
      '3.0',
      '4',
    ]);
    expect(tokenizeToStringArray('1.1,a,3, bc ,d')).toStrictEqual([
      '1.1',
      'a',
      '3',
      'bc',
      'd',
    ]);
  });

  test('evals undefined to null', () => {
    expect(tokenizeToStringArray(undefined)).toBeNull();
  });

  test('evals empty string to null', () => {
    expect(tokenizeToStringArray('')).toBeNull();
    expect(tokenizeToStringArray('    ')).toBeNull();
  });
});
