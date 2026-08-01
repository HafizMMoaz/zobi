import { ChartProps } from '@zobi.dev/core';
import { zobiTheme } from '@zobi.dev/extension-api/theme';
import { EchartsTreemapChartProps } from '../../src/Treemap/types';
import transformProps from '../../src/Treemap/transformProps';

describe('Treemap transformProps', () => {
  const formData = {
    colorScheme: 'bnbColors',
    datasource: '3__table',
    granularity_sqla: 'ds',
    metric: 'sum__num',
    groupby: ['foo', 'bar'],
  };
  const chartProps = new ChartProps({
    formData,
    width: 800,
    height: 600,
    queriesData: [
      {
        data: [
          { foo: 'Sylvester', bar: 'bar1', sum__num: 10 },
          { foo: 'Arnold', bar: 'bar2', sum__num: 2.5 },
        ],
      },
    ],
    theme: zobiTheme,
  });

  test('should transform chart props for viz', () => {
    expect(transformProps(chartProps as EchartsTreemapChartProps)).toEqual(
      expect.objectContaining({
        width: 800,
        height: 600,
        echartOptions: expect.objectContaining({
          series: [
            expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  name: 'sum__num',
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      name: 'Sylvester',
                      children: expect.arrayContaining([
                        expect.objectContaining({
                          name: 'bar1',
                          value: 10,
                        }),
                      ]),
                    }),
                  ]),
                }),
              ]),
            }),
          ],
        }),
      }),
    );
  });
});
