import getFilterConfigsFromFormdata from 'src/dashboard/util/getFilterConfigsFromFormdata';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getFilterConfigsFromFormdata', () => {
  const testFormdata = {
    filter_configs: [
      {
        asc: true,
        clearable: true,
        column: 'state',
        label: 'State',
        defaultValue: 'CA',
        key: 'fvwncPjUf',
        multiple: true,
      },
    ],
    date_filter: true,
    granularity_sqla: '__time',
    time_grain_sqla: 'P1M',
    time_range: '2018-12-30T00:00:00+:+last+saturday',
  };

  test('should add time grain', () => {
    const result = getFilterConfigsFromFormdata({
      ...testFormdata,
      show_sqla_time_granularity: true,
    });
    expect(result.columns).toMatchObject({
      __time_grain: testFormdata.time_grain_sqla,
    });
  });

  test('should add time column', () => {
    const result = getFilterConfigsFromFormdata({
      ...testFormdata,
      show_sqla_time_column: true,
    });
    expect(result.columns).toMatchObject({
      __time_col: testFormdata.granularity_sqla,
    });
  });

  test('should use default value and treat empty defaults as null', () => {
    const result = getFilterConfigsFromFormdata({
      ...testFormdata,
      show_sqla_time_column: true,
      filter_configs: [
        ...testFormdata.filter_configs,
        {
          asc: false,
          clearable: true,
          column: 'country',
          label: 'Country',
          defaultValue: '',
          key: 'foo',
          multiple: true,
        },
      ],
    });
    expect(result.columns).toMatchObject({
      state: ['CA'],
      country: null,
    });
  });

  test('should read multi values from form_data', () => {
    const result = getFilterConfigsFromFormdata({
      ...testFormdata,
      filter_configs: [
        {
          asc: true,
          clearable: true,
          column: 'state',
          label: 'State',
          defaultValue: 'CA;NY',
          key: 'fvwncPjUf',
          multiple: true,
        },
      ],
    });
    expect(result.columns).toMatchObject({
      state: ['CA', 'NY'],
    });
  });
});
