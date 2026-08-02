import { triggerResizeObserver } from 'resize-observer-polyfill';
import { promiseTimeout, WithLegend } from '@zobi.dev/core';
import { render } from '@testing-library/react';

let renderChart = jest.fn();
let renderLegend = jest.fn();

// TODO: rewrite to rtl
/* oxlint-disable-next-line jest/no-disabled-tests */
describe.skip('WithLegend', () => {
  beforeEach(() => {
    renderChart = jest.fn(() => <div className="chart" />);
    renderLegend = jest.fn(() => <div className="legend" />);
  });

  test('sets className', () => {
    const { container } = render(
      <WithLegend
        className="test-class"
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );
    expect(container.querySelectorAll('.test-class')).toHaveLength(1);
  });

  test('renders when renderLegend is not set', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        width={500}
        height={500}
        renderChart={renderChart}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(0);
    }, 100);
  });

  test('renders', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        width={500}
        height={500}
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(renderLegend).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(1);
    }, 100);
  });

  test('renders without width or height', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(renderLegend).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(1);
    }, 100);
  });

  test('renders legend on the left', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        position="left"
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(renderLegend).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(1);
    }, 100);
  });

  test('renders legend on the right', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        position="right"
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(renderLegend).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(1);
    }, 100);
  });

  test('renders legend on the top', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        position="top"
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(renderLegend).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(1);
    }, 100);
  });

  test('renders legend on the bottom', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        position="bottom"
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(renderLegend).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(1);
    }, 100);
  });

  test('renders legend with justifyContent set', () => {
    const { container } = render(
      <WithLegend
        debounceTime={1}
        position="right"
        legendJustifyContent="flex-start"
        renderChart={renderChart}
        renderLegend={renderLegend}
      />,
    );

    triggerResizeObserver();
    // Have to delay more than debounceTime (1ms)
    return promiseTimeout(() => {
      expect(renderChart).toHaveBeenCalledTimes(1);
      expect(renderLegend).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('div.chart')).toHaveLength(1);
      expect(container.querySelectorAll('div.legend')).toHaveLength(1);
    }, 100);
  });
});
