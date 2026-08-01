
import { ChartLayer } from '../../src/components/ChartLayer';
import { ChartLayerOptions } from '../../src/types';

describe('ChartLayer', () => {
  test('creates div and loading mask', () => {
    const options: ChartLayerOptions = {
      chartVizType: 'pie',
      locale: 'en',
    };
    const chartLayer = new ChartLayer(options);

    expect(chartLayer.loadingMask).toBeDefined();
    expect(chartLayer.div).toBeDefined();
  });

  test('can remove chart elements', () => {
    const options: ChartLayerOptions = {
      chartVizType: 'pie',
      locale: 'en',
    };
    const chartLayer = new ChartLayer(options);
    chartLayer.charts = [
      {
        htmlElement: document.createElement('div'),
        root: { render: jest.fn(), unmount: jest.fn() } as any,
        coordinate: [0, 0],
        width: 100,
        height: 100,
        feature: {},
      },
    ];

    chartLayer.removeAllChartElements();
    expect(chartLayer.charts).toEqual([]);
  });
});
