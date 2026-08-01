import { extractTimegrain, QueryFormData } from '@zobi-ui/core';

describe('extractTimegrain', () => {
  const baseFormData: QueryFormData = {
    datasource: 'table__1',
    viz_type: 'my_viz',
  };
  test('should extract regular from form data', () => {
    expect(
      extractTimegrain({
        ...baseFormData,
        time_grain_sqla: 'P1D',
      }),
    ).toEqual('P1D');
  });

  test('should extract filter time grain from form data', () => {
    expect(
      extractTimegrain({
        ...baseFormData,
        time_grain_sqla: 'P1D',
        extra_filters: [
          {
            col: '__time_grain',
            op: '==',
            val: 'P1M',
          },
        ],
      }),
    ).toEqual('P1M');
  });

  test('should extract native filter time grain from form data', () => {
    expect(
      extractTimegrain({
        ...baseFormData,
        time_grain_sqla: 'P1D',
        extra_form_data: {
          time_grain_sqla: 'P1W',
        },
      }),
    ).toEqual('P1W');
  });

  test('should give priority to native filters', () => {
    expect(
      extractTimegrain({
        ...baseFormData,
        time_grain_sqla: 'P1D',
        extra_filters: [
          {
            col: '__time_grain',
            op: '==',
            val: 'P1M',
          },
        ],
        extra_form_data: {
          time_grain_sqla: 'P1W',
        },
      }),
    ).toEqual('P1W');
  });

  test('returns undefined if timegrain not defined', () => {
    expect(extractTimegrain({ ...baseFormData })).toEqual(undefined);
  });
});
