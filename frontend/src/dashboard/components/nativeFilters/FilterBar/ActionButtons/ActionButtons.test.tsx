import { render, screen, userEvent } from 'spec/helpers/testing-library';
import ActionButtons from './index';

const createProps = () => ({
  onApply: jest.fn(),
  onClearAll: jest.fn(),
  dataMaskSelected: {
    DefaultsID: {
      filterState: {
        value: null,
      },
    },
  },
  dataMaskApplied: {
    DefaultsID: {
      id: 'DefaultsID',
      filterState: {
        value: null,
      },
    },
  },
  isApplyDisabled: false,
});

test('should render the "Apply" button', () => {
  const mockedProps = createProps();
  render(<ActionButtons {...mockedProps} />, { useRedux: true });
  expect(screen.getByText('Apply filters')).toBeInTheDocument();
  expect(screen.getByText('Apply filters').parentElement).toBeEnabled();
});

test('should render the "Clear all" button as disabled', () => {
  const mockedProps = createProps();
  render(<ActionButtons {...mockedProps} />, { useRedux: true });
  const clearBtn = screen.getByText('Clear all');
  expect(clearBtn.parentElement).toBeDisabled();
});

test('should render the "Apply" button as disabled', () => {
  const mockedProps = createProps();
  const applyDisabledProps = {
    ...mockedProps,
    isApplyDisabled: true,
  };
  render(<ActionButtons {...applyDisabledProps} />, { useRedux: true });
  const applyBtn = screen.getByText('Apply filters');
  expect(applyBtn.parentElement).toBeDisabled();
  userEvent.click(applyBtn);
  expect(mockedProps.onApply).not.toHaveBeenCalled();
});

test('should apply', () => {
  const mockedProps = createProps();
  render(<ActionButtons {...mockedProps} />, { useRedux: true });
  const applyBtn = screen.getByText('Apply filters');
  expect(mockedProps.onApply).not.toHaveBeenCalled();
  userEvent.click(applyBtn);
  expect(mockedProps.onApply).toHaveBeenCalled();
});
