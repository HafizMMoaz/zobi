import '@testing-library/jest-dom';
import { screen, render, fireEvent, act } from '@zobi-ui/core/spec';
import type { ColumnMeta } from '@zobi-ui/chart-controls';
import OptionDescription from '../src/OptionDescription';

const defaultProps = {
  option: {
    label: 'Some option',
    description: 'Description for some option',
  } as unknown as ColumnMeta,
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('OptionDescription', () => {
  beforeEach(() => {
    const props = { option: { ...defaultProps.option } };
    render(<OptionDescription {...props} />);
  });

  test('renders an InfoTooltip', () => {
    const tooltipTrigger = screen.getByLabelText('Show info tooltip');
    expect(tooltipTrigger).toBeInTheDocument();

    // Perform delayed mouse hovering so tooltip could pop out
    fireEvent.mouseOver(tooltipTrigger);
    act(() => jest.runAllTimers());

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Description for some option');
  });

  test('renders a span with the label', () => {
    expect(
      screen.getByText('Some option', { selector: 'span' }),
    ).toBeInTheDocument();
  });
});
