import { ChartProps, QueryFormData, VizType } from '@zobi.dev/core';
import { zobiTheme } from '@zobi.dev/extension-api/theme';
import { HandlebarsQueryFormData } from '../../src/types';
import transformProps from '../../src/plugin/transformProps';

describe('Handlebars transformProps', () => {
  const formData: HandlebarsQueryFormData = {
    colorScheme: 'bnbColors',
    datasource: '3__table',
    granularitySqla: 'ds',
    metric: 'sum__num',
    groupby: ['name'],
    width: 500,
    height: 500,
    viz_type: VizType.Handlebars,
  };
  const data = [{ name: 'Hulk', sum__num: 1, __timestamp: 599616000000 }];
  const chartProps = new ChartProps<QueryFormData>({
    formData,
    width: 800,
    height: 600,
    queriesData: [{ data }],
    theme: zobiTheme,
  });

  test('should transform chart props for viz', () => {
    expect(transformProps(chartProps)).toEqual(
      expect.objectContaining({
        width: 800,
        height: 600,
        data,
      }),
    );
  });
});
