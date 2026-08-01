import { render, screen } from '@zobi.dev/core/spec';
import '@testing-library/jest-dom';
import {
  getColumnLabelText,
  getColumnTooltipNode,
  getMetricTooltipNode,
  getColumnTypeTooltipNode,
} from '../../src/components/labelUtils';
import { GenericDataType } from '@zobi.dev/extension-api/common';

test("should get column name when column doesn't have verbose_name", () => {
  expect(
    getColumnLabelText({
      id: 123,
      column_name: 'column name',
      verbose_name: '',
    }),
  ).toBe('column name');
});

test('should get verbose name when column have verbose_name', () => {
  expect(
    getColumnLabelText({
      id: 123,
      column_name: 'column name',
      verbose_name: 'verbose name',
    }),
  ).toBe('verbose name');
});

test('should get null as tooltip', () => {
  const ref = { current: { scrollWidth: 100, clientWidth: 100 } };
  expect(
    getColumnTooltipNode(
      {
        id: 123,
        column_name: 'column name',
        verbose_name: '',
        description: '',
      },
      ref,
    ),
  ).toBe(null);
});

test('should get null for column datatype tooltip when type is blank', () => {
  expect(
    getColumnTypeTooltipNode({
      id: 123,
      column_name: 'column name',
      verbose_name: '',
      description: '',
      type: '',
    }),
  ).toBe(null);
});

test('should get column datatype rendered as tooltip when column has a type', () => {
  render(
    <>
      {getColumnTypeTooltipNode({
        id: 123,
        column_name: 'column name',
        verbose_name: 'verbose name',
        description: 'A very important column',
        type: 'text',
      })}
    </>,
  );

  expect(screen.getByText('Column type')).toBeVisible();
  expect(screen.getByText('text')).toBeVisible();
});

test('should fall back to generic data type label when type is "column"', () => {
  render(
    <>
      {getColumnTypeTooltipNode({
        id: 123,
        column_name: 'column name',
        verbose_name: '',
        description: '',
        type: 'column',
        type_generic: GenericDataType.String,
      })}
    </>,
  );

  expect(screen.getByText('Column type')).toBeVisible();
  expect(screen.getByText('string')).toBeVisible();
});

test('should get column name, verbose name and description when it has a verbose name', () => {
  const ref = { current: { scrollWidth: 100, clientWidth: 100 } };
  render(
    <>
      {getColumnTooltipNode(
        {
          id: 123,
          column_name: 'column name',
          verbose_name: 'verbose name',
          description: 'A very important column',
        },
        ref,
      )}
    </>,
  );

  expect(screen.getByText('Column name')).toBeVisible();
  expect(screen.getByText('column name')).toBeVisible();
  expect(screen.getByText('Label')).toBeVisible();
  expect(screen.getByText('verbose name')).toBeVisible();
  expect(screen.getByText('Description')).toBeVisible();
  expect(screen.getByText('A very important column')).toBeVisible();
});

test('should get column name as tooltip if it overflowed', () => {
  const ref = { current: { scrollWidth: 200, clientWidth: 100 } };
  render(
    <>
      {getColumnTooltipNode(
        {
          id: 123,
          column_name: 'long long long long column name',
          verbose_name: '',
          description: '',
        },
        ref,
      )}
    </>,
  );
  expect(screen.getByText('Column name')).toBeVisible();
  expect(screen.getByText('long long long long column name')).toBeVisible();
  expect(screen.queryByText('Label')).not.toBeInTheDocument();
  expect(screen.queryByText('Description')).not.toBeInTheDocument();
});

test('should get column name, verbose name and description as tooltip if it overflowed', () => {
  const ref = { current: { scrollWidth: 200, clientWidth: 100 } };
  render(
    <>
      {getColumnTooltipNode(
        {
          id: 123,
          column_name: 'long long long long column name',
          verbose_name: 'long long long long verbose name',
          description: 'A very important column',
        },
        ref,
      )}
    </>,
  );

  expect(screen.getByText('Column name')).toBeVisible();
  expect(screen.getByText('long long long long column name')).toBeVisible();
  expect(screen.getByText('Label')).toBeVisible();
  expect(screen.getByText('long long long long verbose name')).toBeVisible();
  expect(screen.getByText('Description')).toBeVisible();
  expect(screen.getByText('A very important column')).toBeVisible();
});

test('should get null as tooltip in metric', () => {
  const ref = { current: { scrollWidth: 100, clientWidth: 100 } };
  expect(
    getMetricTooltipNode(
      {
        metric_name: 'count',
        label: '',
        verbose_name: '',
        description: '',
      },
      ref,
    ),
  ).toBe(null);
});

test('should get metric name, verbose name and description as tooltip in metric', () => {
  const ref = { current: { scrollWidth: 100, clientWidth: 100 } };
  render(
    <>
      {getMetricTooltipNode(
        {
          metric_name: 'count',
          label: 'count(*)',
          verbose_name: 'count(*)',
          description: 'Count metric',
        },
        ref,
      )}
    </>,
  );
  expect(screen.getByText('Metric name')).toBeVisible();
  expect(screen.getByText('count')).toBeVisible();
  expect(screen.getByText('Label')).toBeVisible();
  expect(screen.getByText('count(*)')).toBeVisible();
  expect(screen.getByText('Description')).toBeVisible();
  expect(screen.getByText('Count metric')).toBeVisible();
});

test('should get metric name as tooltip if it overflowed', () => {
  const ref = { current: { scrollWidth: 200, clientWidth: 100 } };
  render(
    <>
      {getMetricTooltipNode(
        {
          metric_name: 'long long long long metric name',
          label: '',
          verbose_name: '',
          description: '',
        },
        ref,
      )}
    </>,
  );
  expect(screen.getByText('Metric name')).toBeVisible();
  expect(screen.getByText('long long long long metric name')).toBeVisible();
  expect(screen.queryByText('Label')).not.toBeInTheDocument();
  expect(screen.queryByText('Description')).not.toBeInTheDocument();
});

test('should get metric name, verbose name and description in tooltip if it overflowed', () => {
  const ref = { current: { scrollWidth: 200, clientWidth: 100 } };
  render(
    <>
      {getMetricTooltipNode(
        {
          metric_name: 'count',
          label: '',
          verbose_name: 'longlonglonglonglong verbose metric',
          description: 'Count metric',
        },
        ref,
      )}
    </>,
  );
  expect(screen.getByText('Metric name')).toBeVisible();
  expect(screen.getByText('count')).toBeVisible();
  expect(screen.getByText('Label')).toBeVisible();
  expect(screen.getByText('longlonglonglonglong verbose metric')).toBeVisible();
  expect(screen.getByText('Description')).toBeVisible();
  expect(screen.getByText('Count metric')).toBeVisible();
});
