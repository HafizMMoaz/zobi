import { ChartMetadata } from '@zobi.dev/core';

describe('ChartMetadata', () => {
  test('exists', () => {
    expect(ChartMetadata).toBeDefined();
  });
  describe('new ChartMetadata({})', () => {
    test('creates new metadata instance', () => {
      const metadata = new ChartMetadata({
        name: 'test chart',
        credits: [],
        description: 'some kind of chart',
        thumbnail: 'test.png',
      });
      expect(metadata).toBeInstanceOf(ChartMetadata);
    });
  });
  describe('.canBeAnnotationType(type)', () => {
    const metadata = new ChartMetadata({
      name: 'test chart',
      canBeAnnotationTypes: ['event'],
      credits: [],
      description: 'some kind of chart',
      thumbnail: 'test.png',
    });
    test('returns true if can', () => {
      expect(metadata.canBeAnnotationType('event')).toBeTruthy();
    });
    test('returns false otherwise', () => {
      expect(metadata.canBeAnnotationType('invalid-type')).toBeFalsy();
    });
  });
  describe('.clone()', () => {
    const metadata = new ChartMetadata({
      name: 'test chart',
      canBeAnnotationTypes: ['event'],
      credits: [],
      description: 'some kind of chart',
      thumbnail: 'test.png',
    });
    const clone = metadata.clone();

    test('returns a new instance', () => {
      expect(metadata).not.toBe(clone);
    });
    test('returns a new instance with same field values', () => {
      expect(metadata.name).toEqual(clone.name);
      expect(metadata.credits).toEqual(clone.credits);
      expect(metadata.description).toEqual(clone.description);
      expect(metadata.canBeAnnotationTypes).toEqual(clone.canBeAnnotationTypes);
      expect(metadata.thumbnail).toEqual(clone.thumbnail);
    });
  });
});
