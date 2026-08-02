import { isVersionBelow } from '../../src/util/serviceUtil';

describe('serviceUtil', () => {
  describe('isVersionBelow', () => {
    describe('WMS', () => {
      test('recognizes the higher version', () => {
        const result = isVersionBelow('1.3.0', '1.1.0', 'WMS');
        expect(result).toEqual(false);
      });
      test('recognizes the lower version', () => {
        const result = isVersionBelow('1.1.1', '1.3.0', 'WMS');
        expect(result).toEqual(true);
      });
    });

    describe('WFS', () => {
      test('recognizes the higher version', () => {
        const result = isVersionBelow('2.0.2', '1.1.0', 'WFS');
        expect(result).toEqual(false);
      });
      test('recognizes the lower version', () => {
        const result = isVersionBelow('1.1.0', '2.0.2', 'WFS');
        expect(result).toEqual(true);
      });
    });
  });
});
