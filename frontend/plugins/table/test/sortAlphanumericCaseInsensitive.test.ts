import { defaultOrderByFn, Row } from 'react-table';
import { sortAlphanumericCaseInsensitive } from '../src/DataTable/utils/sortAlphanumericCaseInsensitive';

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] | RecursivePartial<T[P]>;
};

const testData = [
  {
    values: {
      col: 'test value',
    },
  },
  {
    values: {
      col: 'a lowercase test value',
    },
  },
  {
    values: {
      col: '5',
    },
  },
  {
    values: {
      col: NaN,
    },
  },
  {
    values: {
      col: '1234',
    },
  },
  {
    values: {
      col: Infinity,
    },
  },
  {
    values: {
      col: '.!# value starting with non-letter characters',
    },
  },
  {
    values: {
      col: 'An uppercase test value',
    },
  },
  {
    values: {
      col: undefined,
    },
  },
  {
    values: {
      col: null,
    },
  },
];

describe('sortAlphanumericCaseInsensitive', () => {
  test('Sort rows', () => {
    const sorted = [...testData].sort((a, b) =>
      // @ts-expect-error
      sortAlphanumericCaseInsensitive(a, b, 'col'),
    );

    expect(sorted).toEqual([
      {
        values: {
          col: null,
        },
      },
      {
        values: {
          col: undefined,
        },
      },
      {
        values: {
          col: Infinity,
        },
      },
      {
        values: {
          col: NaN,
        },
      },
      {
        values: {
          col: '.!# value starting with non-letter characters',
        },
      },
      {
        values: {
          col: '1234',
        },
      },
      {
        values: {
          col: '5',
        },
      },
      {
        values: {
          col: 'a lowercase test value',
        },
      },
      {
        values: {
          col: 'An uppercase test value',
        },
      },
      {
        values: {
          col: 'test value',
        },
      },
    ]);
  });
});

const testDataMulti: Array<RecursivePartial<Row<object>>> = [
  {
    values: {
      colA: 'group 1',
      colB: '10',
    },
  },
  {
    values: {
      colA: 'group 1',
      colB: '15',
    },
  },
  {
    values: {
      colA: 'group 1',
      colB: '20',
    },
  },
  {
    values: {
      colA: 'group 2',
      colB: '10',
    },
  },
  {
    values: {
      colA: 'group 3',
      colB: '10',
    },
  },
  {
    values: {
      colA: 'group 3',
      colB: '15',
    },
  },
  {
    values: {
      colA: 'group 3',
      colB: '10',
    },
  },
];

describe('sortAlphanumericCaseInsensitiveMulti', () => {
  test('Sort rows', () => {
    const sorted = defaultOrderByFn(
      [...testDataMulti] as Array<Row<object>>,
      [
        (a, b) => sortAlphanumericCaseInsensitive(a, b, 'colA'),
        (a, b) => sortAlphanumericCaseInsensitive(a, b, 'colB'),
      ],
      [true, false],
    );

    expect(sorted).toEqual([
      {
        values: {
          colA: 'group 1',
          colB: '20',
        },
      },
      {
        values: {
          colA: 'group 1',
          colB: '15',
        },
      },
      {
        values: {
          colA: 'group 1',
          colB: '10',
        },
      },
      {
        values: {
          colA: 'group 2',
          colB: '10',
        },
      },
      {
        values: {
          colA: 'group 3',
          colB: '15',
        },
      },
      {
        values: {
          colA: 'group 3',
          colB: '10',
        },
      },
      {
        values: {
          colA: 'group 3',
          colB: '10',
        },
      },
    ]);
  });
});
