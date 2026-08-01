import { render, screen } from 'spec/helpers/testing-library';
import { Comparator } from '@zobi.dev/chart-controls';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import ConditionalFormattingControl from './ConditionalFormattingControl';
import { ConditionalFormattingConfig } from './types';

const columnOptions = [
  { label: 'My Column', value: 'my_col', dataType: GenericDataType.Boolean },
];

const defaultProps = {
  columnOptions,
  verboseMap: {} as Record<string, string>,
  removeIrrelevantConditions: false,
  label: 'Conditional Formatting',
  description: 'Test',
  name: 'conditional_formatting',
  onChange: jest.fn(),
};

test('renders "is false" operator label without trailing undefined', () => {
  const value: ConditionalFormattingConfig[] = [
    {
      column: 'my_col',
      operator: Comparator.IsFalse,
      colorScheme: 'colorSuccess',
    },
  ];
  render(<ConditionalFormattingControl {...defaultProps} value={value} />);
  expect(screen.getByText('my_col is false')).toBeInTheDocument();
});

test('renders "is true" operator label without trailing undefined', () => {
  const value: ConditionalFormattingConfig[] = [
    {
      column: 'my_col',
      operator: Comparator.IsTrue,
      colorScheme: 'colorSuccess',
    },
  ];
  render(<ConditionalFormattingControl {...defaultProps} value={value} />);
  expect(screen.getByText('my_col is true')).toBeInTheDocument();
});

test('renders "is null" operator label without trailing undefined', () => {
  const value: ConditionalFormattingConfig[] = [
    {
      column: 'my_col',
      operator: Comparator.IsNull,
      colorScheme: 'colorSuccess',
    },
  ];
  render(<ConditionalFormattingControl {...defaultProps} value={value} />);
  expect(screen.getByText('my_col is null')).toBeInTheDocument();
});

test('renders "is not null" operator label without trailing undefined', () => {
  const value: ConditionalFormattingConfig[] = [
    {
      column: 'my_col',
      operator: Comparator.IsNotNull,
      colorScheme: 'colorSuccess',
    },
  ];
  render(<ConditionalFormattingControl {...defaultProps} value={value} />);
  expect(screen.getByText('my_col is not null')).toBeInTheDocument();
});

test('renders verbose column name when available', () => {
  const value: ConditionalFormattingConfig[] = [
    {
      column: 'my_col',
      operator: Comparator.IsFalse,
      colorScheme: 'colorSuccess',
    },
  ];
  render(
    <ConditionalFormattingControl
      {...defaultProps}
      verboseMap={{ my_col: 'My Column' }}
      value={value}
    />,
  );
  expect(screen.getByText('My Column is false')).toBeInTheDocument();
});
