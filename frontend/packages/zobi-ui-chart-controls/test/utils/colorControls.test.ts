import { getColorControlsProps } from '../../src';

describe('getColorControlsProps', () => {
  test('should return default values when state is empty', () => {
    const state = {};
    const result = getColorControlsProps(state);
    expect(result).toEqual({
      chartId: undefined,
      dashboardId: undefined,
      hasDashboardColorScheme: false,
      hasCustomLabelsColor: false,
      colorNamespace: undefined,
      mapLabelsColors: {},
      sharedLabelsColors: [],
    });
  });

  test('should return correct values when state has form_data with dashboardId and color scheme', () => {
    const state = {
      form_data: {
        dashboardId: 123,
        dashboard_color_scheme: 'blueScheme',
        label_colors: {},
      },
      slice: { slice_id: 456 },
    };
    const result = getColorControlsProps(state);
    expect(result).toEqual({
      chartId: 456,
      dashboardId: 123,
      hasDashboardColorScheme: true,
      hasCustomLabelsColor: false,
      colorNamespace: undefined,
      mapLabelsColors: {},
      sharedLabelsColors: [],
    });
  });

  test('should detect custom label colors correctly', () => {
    const state = {
      form_data: {
        dashboardId: 123,
        label_colors: { label1: '#000000' },
      },
      slice: { slice_id: 456 },
    };
    const result = getColorControlsProps(state);
    expect(result).toEqual({
      chartId: 456,
      dashboardId: 123,
      hasDashboardColorScheme: false,
      hasCustomLabelsColor: true,
      colorNamespace: undefined,
      mapLabelsColors: {},
      sharedLabelsColors: [],
    });
  });

  test('should return shared label colors when available', () => {
    const state = {
      form_data: {
        shared_label_colors: ['#FF5733', '#33FF57'],
      },
    };
    const result = getColorControlsProps(state);
    expect(result).toEqual({
      chartId: undefined,
      dashboardId: undefined,
      hasDashboardColorScheme: false,
      hasCustomLabelsColor: false,
      sharedLabelsColors: ['#FF5733', '#33FF57'],
      colorNamespace: undefined,
      mapLabelsColors: {},
    });
  });

  test('should handle missing form_data and slice properties', () => {
    const state = {
      form_data: {
        dashboardId: 789,
      },
    };
    const result = getColorControlsProps(state);
    expect(result).toEqual({
      chartId: undefined,
      dashboardId: 789,
      hasDashboardColorScheme: false,
      hasCustomLabelsColor: false,
      colorNamespace: undefined,
      mapLabelsColors: {},
      sharedLabelsColors: [],
    });
  });
});
