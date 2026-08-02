import { computeMaxFontSize } from '@zobi.dev/core';
import { addDummyFill, removeDummyFill, SAMPLE_TEXT } from './getBBoxDummyFill';

describe('computeMaxFontSize(input)', () => {
  describe('returns dimension of the given text', () => {
    beforeEach(addDummyFill);
    afterEach(removeDummyFill);

    test('requires either idealFontSize or maxHeight', () => {
      expect(() => {
        computeMaxFontSize({
          text: SAMPLE_TEXT[0],
        });
      }).toThrow();
    });
    test('computes maximum font size for given maxWidth and maxHeight', () => {
      expect(
        computeMaxFontSize({
          maxWidth: 400,
          maxHeight: 30,
          text: 'sample text',
        }),
      ).toEqual(30);
    });
    test('computes maximum font size for given idealFontSize and maxHeight', () => {
      expect(
        computeMaxFontSize({
          maxHeight: 20,
          idealFontSize: 40,
          text: SAMPLE_TEXT[0],
        }),
      ).toEqual(20);
    });
    test('computes maximum font size for given maxWidth and idealFontSize', () => {
      expect(
        computeMaxFontSize({
          maxWidth: 250,
          idealFontSize: 40,
          text: SAMPLE_TEXT[0],
        }),
      ).toEqual(25);
    });
    test('ensure idealFontSize is used if the maximum font size calculation goes below zero', () => {
      expect(
        computeMaxFontSize({
          maxWidth: 5,
          idealFontSize: 34,
          text: SAMPLE_TEXT[0],
        }),
      ).toEqual(34);
    });
  });
});
