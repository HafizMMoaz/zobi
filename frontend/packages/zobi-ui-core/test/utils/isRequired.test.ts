

import { isRequired } from '@zobi-ui/core';

describe('isRequired(field)', () => {
  test('should throw error with the given field in the message', () => {
    expect(() => isRequired('myField')).toThrow(Error);
  });
});
