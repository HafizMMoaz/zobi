import {
  expandControlConfig,
  sharedControls,
  CustomControlItem,
  sharedControlComponents,
} from '../../src';

describe('expandControlConfig()', () => {
  test('expands shared control alias', () => {
    expect(expandControlConfig('metrics')).toEqual({
      name: 'metrics',
      config: sharedControls.metrics,
    });
  });

  test('expands control with overrides', () => {
    expect(
      expandControlConfig({
        name: 'metrics',
        override: {
          label: 'Custom Metric',
        },
      }),
    ).toEqual({
      name: 'metrics',
      config: {
        ...sharedControls.metrics,
        label: 'Custom Metric',
      },
    });
  });

  test('leave full control untouched', () => {
    const input = {
      name: 'metrics',
      config: {
        type: 'SelectControl',
        label: 'Custom Metric',
      },
    };
    expect(expandControlConfig(input)).toEqual(input);
  });

  test('load shared components in chart-controls', () => {
    const input = {
      name: 'metrics',
      config: {
        type: 'RadioButtonControl',
        label: 'Custom Metric',
      },
    };
    expect(
      (expandControlConfig(input) as CustomControlItem).config.type,
    ).toEqual(sharedControlComponents.RadioButtonControl);
  });

  test('leave NULL and ReactElement untouched', () => {
    expect(expandControlConfig(null)).toBeNull();
    const input = <h1>Test</h1>;
    expect(expandControlConfig(input)).toBe(input);
  });

  test('leave unknown text untouched', () => {
    const input = 'zobi-ui';
    expect(expandControlConfig(input as never)).toBe(input);
  });

  test('return null for invalid configs', () => {
    expect(
      expandControlConfig({ type: 'SelectControl', label: 'Hello' } as never),
    ).toBeNull();
  });
});
