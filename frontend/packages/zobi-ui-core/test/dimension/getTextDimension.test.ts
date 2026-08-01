

import { promiseTimeout, getTextDimension } from '@zobi-ui/core';
import { addDummyFill, removeDummyFill, SAMPLE_TEXT } from './getBBoxDummyFill';

describe('getTextDimension(input)', () => {
  describe('returns default dimension if getBBox() is not available', () => {
    test('returns default value for default dimension', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
        }),
      ).toEqual({
        height: 20,
        width: 100,
      });
    });
    test('return specified value if specified', () => {
      expect(
        getTextDimension(
          {
            text: SAMPLE_TEXT[0],
          },
          {
            height: 30,
            width: 400,
          },
        ),
      ).toEqual({
        height: 30,
        width: 400,
      });
    });
  });
  describe('returns dimension of the given text', () => {
    beforeEach(addDummyFill);
    afterEach(removeDummyFill);

    test('takes text as argument', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
        }),
      ).toEqual({
        height: 20,
        width: 200,
      });
    });
    test('accepts provided class via className', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
          className: 'test-class',
        }),
      ).toEqual({
        height: 20,
        width: 100, // width is 100 after adding class
      });
    });
    test('accepts provided style.font', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
          style: {
            font: 'italic 700 30px Lobster',
          },
        }),
      ).toEqual({
        height: 30, // 20 * (30/20) [fontSize=30]
        width: 1125, // 250 [fontFamily=Lobster] * (30/20) [fontSize=30] * 1.5 [fontStyle=italic] * 2 [fontWeight=700]
      });
    });
    test('accepts provided style.fontFamily', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
          style: {
            fontFamily: 'Lobster',
          },
        }),
      ).toEqual({
        height: 20,
        width: 250, // (250 [fontFamily=Lobster]
      });
    });
    test('accepts provided style.fontSize', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
          style: {
            fontSize: '40px',
          },
        }),
      ).toEqual({
        height: 40, // 20 [baseHeight] * (40/20) [fontSize=40]
        width: 400, // 200 [baseWidth] * (40/20) [fontSize=40]
      });
    });
    test('accepts provided style.fontStyle', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
          style: {
            fontStyle: 'italic',
          },
        }),
      ).toEqual({
        height: 20,
        width: 300, // 200 [baseWidth] * 1.5 [fontStyle=italic]
      });
    });
    test('accepts provided style.fontWeight', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
          style: {
            fontWeight: 700,
          },
        }),
      ).toEqual({
        height: 20,
        width: 400, // 200 [baseWidth] * 2 [fontWeight=700]
      });
    });
    test('accepts provided style.letterSpacing', () => {
      expect(
        getTextDimension({
          text: SAMPLE_TEXT[0],
          style: {
            letterSpacing: '1.1',
          },
        }),
      ).toEqual({
        height: 20,
        width: 221, // Ceiling(200 [baseWidth] * 1.1 [letterSpacing=1.1])
      });
    });
    test('handle empty text', () => {
      expect(
        getTextDimension({
          text: '',
        }),
      ).toEqual({
        height: 0,
        width: 0,
      });
    });
  });
  test('cleans up DOM', async () => {
    getTextDimension({
      text: SAMPLE_TEXT[0],
    });

    expect(document.querySelectorAll('svg')).toHaveLength(1);
    await promiseTimeout(() => {}, 501);
    expect(document.querySelector('svg')).toBeNull();
  });
});
