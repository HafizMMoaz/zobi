

import getBBoxCeil from '../../../src/dimension/svg/getBBoxCeil';
import createTextNode from '../../../src/dimension/svg/createTextNode';

describe('getBBoxCeil(node, defaultDimension)', () => {
  describe('returns default dimension if getBBox() is not available', () => {
    test('returns default value for default dimension', () => {
      expect(getBBoxCeil(createTextNode())).toEqual({
        height: 20,
        width: 100,
      });
    });
    test('return specified value if specified', () => {
      expect(
        getBBoxCeil(createTextNode(), {
          height: 30,
          width: 400,
        }),
      ).toEqual({
        height: 30,
        width: 400,
      });
    });
  });
  describe('returns ceiling of the svg element', () => {
    test('converts to ceiling if value is not integer', () => {
      expect(
        getBBoxCeil(createTextNode(), { height: 10.6, width: 11.1 }),
      ).toEqual({
        height: 11,
        width: 12,
      });
    });

    test('does nothing if value is integer', () => {
      expect(getBBoxCeil(createTextNode())).toEqual({
        height: 20,
        width: 100,
      });
    });
  });
});
