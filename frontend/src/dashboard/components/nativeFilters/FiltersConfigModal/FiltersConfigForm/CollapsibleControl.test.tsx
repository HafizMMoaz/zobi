import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CollapsibleControl } from './CollapsibleControl';

const defaultProps = {
  title: 'Test Control',
  children: <div data-test="child-content">Child Content</div>,
};

const renderCollapsibleControl = (props = {}) =>
  render(<CollapsibleControl {...defaultProps} {...props} />);

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('CollapsibleControl', () => {
  test('renders title correctly', () => {
    const { getByRole } = renderCollapsibleControl();
    expect(
      getByRole('checkbox', { name: /test control/i }),
    ).toBeInTheDocument();
  });

  test('renders tooltip when provided', () => {
    const tooltipText = 'Test tooltip';
    renderCollapsibleControl({ tooltip: tooltipText });

    const tooltip = screen.getByRole('button', { name: 'Show info tooltip' });
    expect(tooltip).toBeInTheDocument();
  });

  test('starts collapsed when initialValue is false', () => {
    renderCollapsibleControl({ initialValue: false });
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  test('starts expanded when initialValue is true', () => {
    renderCollapsibleControl({ initialValue: true });

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  test('toggles content when clicked', async () => {
    renderCollapsibleControl();
    const checkbox = screen.getByRole('checkbox', { name: /Test Control/i });

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();

    await userEvent.click(checkbox);
    expect(screen.getByTestId('child-content')).toBeInTheDocument();

    await userEvent.click(checkbox);
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  test('calls onChange handler when toggled', async () => {
    const onChangeMock = jest.fn();
    renderCollapsibleControl({ onChange: onChangeMock });
    const checkbox = screen.getByRole('checkbox', { name: /Test Control/i });

    await userEvent.click(checkbox);
    expect(onChangeMock).toHaveBeenCalledWith(true);

    await userEvent.click(checkbox);
    expect(onChangeMock).toHaveBeenCalledWith(false);
  });

  test('respects disabled prop', async () => {
    const onChangeMock = jest.fn();
    renderCollapsibleControl({
      disabled: true,
      onChange: onChangeMock,
    });

    const checkbox = screen.getByRole('checkbox', { name: /Test Control/i });
    expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox);
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  test('updates when controlled checked prop changes', () => {
    const { rerender } = renderCollapsibleControl({ checked: false });
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();

    rerender(<CollapsibleControl {...defaultProps} checked />);
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  test('maintains local state when in uncontrolled mode', async () => {
    renderCollapsibleControl({ initialValue: false });
    const checkbox = screen.getByRole('checkbox', { name: /Test Control/i });

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();

    await userEvent.click(checkbox);
    expect(screen.getByTestId('child-content')).toBeInTheDocument();

    await userEvent.click(checkbox);
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });
});
