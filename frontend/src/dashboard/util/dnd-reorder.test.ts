import reorderItem from 'src/dashboard/util/dnd-reorder';
import { TABS_TYPE } from './componentTypes';
import { DROP_LEFT, DROP_RIGHT } from './getDropPosition';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('dnd-reorderItem', () => {
  test('should remove the item from its source entity and add it to its destination entity', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          children: ['x', 'y', 'z'],
        },
        b: {
          id: 'b',
          children: ['banana'],
        },
      },
      source: { id: 'a', index: 2 },
      destination: { id: 'b', index: 1 },
    });

    expect(result.a.children).toEqual(['x', 'y']);
    expect(result.b.children).toEqual(['banana', 'z']);
  });

  test('should correctly move elements within the same list', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          children: ['x', 'y', 'z'],
        },
      },
      source: { id: 'a', index: 2 },
      destination: { id: 'a', index: 0 },
    });

    expect(result.a.children).toEqual(['z', 'x', 'y']);
  });

  test('should copy items that do not move into the result', () => {
    const extraEntity = { children: [] as string[] };
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          children: ['x', 'y', 'z'],
        },
        b: {
          id: 'b',
          children: ['banana'],
        },
        iAmExtra: extraEntity,
      },
      source: { id: 'a', index: 2 },
      destination: { id: 'b', index: 1 },
    });

    expect(result.iAmExtra).toBe(extraEntity);
  });

  test('should handle out of bounds destination index gracefully', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          children: ['x', 'y', 'z'],
        },
        b: {
          id: 'b',
          children: ['banana'],
        },
      },
      source: { id: 'a', index: 1 },
      destination: { id: 'b', index: 5 },
    });

    expect(result.a.children).toEqual(['x', 'z']);
    expect(result.b.children).toEqual(['banana', 'y']);
  });

  test('should do nothing if source and destination are the same and indices are the same', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          children: ['x', 'y', 'z'],
        },
      },
      source: { id: 'a', index: 1 },
      destination: { id: 'a', index: 1 },
    });

    expect(result.a.children).toEqual(['x', 'y', 'z']);
  });

  test('should handle DROP_LEFT in the same TABS_TYPE list correctly', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          type: TABS_TYPE,
          children: ['x', 'y', 'z'],
        },
      },
      source: { id: 'a', type: TABS_TYPE, index: 2 },
      destination: { id: 'a', type: TABS_TYPE, index: 1 },
      position: DROP_LEFT,
    });

    expect(result.a.children).toEqual(['x', 'z', 'y']);
  });

  test('should handle DROP_RIGHT in the same TABS_TYPE list correctly', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          type: TABS_TYPE,
          children: ['x', 'y', 'z'],
        },
      },
      source: { id: 'a', type: TABS_TYPE, index: 0 },
      destination: { id: 'a', type: TABS_TYPE, index: 1 },
      position: DROP_RIGHT,
    });

    expect(result.a.children).toEqual(['y', 'x', 'z']);
  });

  test('should handle DROP_LEFT when moving between different TABS_TYPE lists', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          type: TABS_TYPE,
          children: ['x', 'y'],
        },
        b: {
          id: 'b',
          type: TABS_TYPE,
          children: ['banana'],
        },
      },
      source: { id: 'a', type: TABS_TYPE, index: 1 },
      destination: { id: 'b', type: TABS_TYPE, index: 0 },
      position: DROP_LEFT,
    });

    expect(result.a.children).toEqual(['x']);
    expect(result.b.children).toEqual(['y', 'banana']);
  });

  test('should handle DROP_RIGHT when moving between different TABS_TYPE lists', () => {
    const result = reorderItem({
      entitiesMap: {
        a: {
          id: 'a',
          type: TABS_TYPE,
          children: ['x', 'y'],
        },
        b: {
          id: 'b',
          type: TABS_TYPE,
          children: ['banana'],
        },
      },
      source: { id: 'a', type: TABS_TYPE, index: 0 },
      destination: { id: 'b', type: TABS_TYPE, index: 0 },
      position: DROP_RIGHT,
    });

    expect(result.a.children).toEqual(['y']);
    expect(result.b.children).toEqual(['banana', 'x']);
  });
});
