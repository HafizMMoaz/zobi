import { treeBuilder } from '../../src/utils/treeBuilder';

describe('test treeBuilder', () => {
  const data = [
    {
      foo: 'a-1',
      bar: 'a',
      count: 2,
      count2: 3,
    },
    {
      foo: 'a-2',
      bar: 'a',
      count: 2,
      count2: 3,
    },
    {
      foo: 'b-1',
      bar: 'b',
      count: 2,
      count2: 3,
    },
    {
      foo: 'b-2',
      bar: 'b',
      count: 2,
      count2: 3,
    },
    {
      foo: 'c-1',
      bar: 'c',
      count: 2,
      count2: 3,
    },
    {
      foo: 'c-2',
      bar: 'c',
      count: 2,
      count2: 3,
    },
    {
      foo: 'd-1',
      bar: 'd',
      count: 2,
      count2: 3,
    },
  ];
  test('should build tree as expected', () => {
    const tree = treeBuilder(data, ['foo', 'bar'], 'count');
    expect(tree).toEqual([
      {
        children: [
          {
            groupBy: 'bar',
            name: 'a',
            secondaryValue: 2,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'a-1',
        secondaryValue: 2,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'a',
            secondaryValue: 2,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'a-2',
        secondaryValue: 2,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'b',
            secondaryValue: 2,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'b-1',
        secondaryValue: 2,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'b',
            secondaryValue: 2,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'b-2',
        secondaryValue: 2,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'c',
            secondaryValue: 2,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'c-1',
        secondaryValue: 2,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'c',
            secondaryValue: 2,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'c-2',
        secondaryValue: 2,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'd',
            secondaryValue: 2,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'd-1',
        secondaryValue: 2,
        value: 2,
      },
    ]);
  });

  test('should build tree with secondaryValue as expected', () => {
    const tree = treeBuilder(data, ['foo', 'bar'], 'count', 'count2');
    expect(tree).toEqual([
      {
        children: [
          {
            groupBy: 'bar',
            name: 'a',
            secondaryValue: 3,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'a-1',
        secondaryValue: 3,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'a',
            secondaryValue: 3,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'a-2',
        secondaryValue: 3,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'b',
            secondaryValue: 3,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'b-1',
        secondaryValue: 3,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'b',
            secondaryValue: 3,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'b-2',
        secondaryValue: 3,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'c',
            secondaryValue: 3,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'c-1',
        secondaryValue: 3,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'c',
            secondaryValue: 3,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'c-2',
        secondaryValue: 3,
        value: 2,
      },
      {
        children: [
          {
            groupBy: 'bar',
            name: 'd',
            secondaryValue: 3,
            value: 2,
          },
        ],
        groupBy: 'foo',
        name: 'd-1',
        secondaryValue: 3,
        value: 2,
      },
    ]);
  });
});
