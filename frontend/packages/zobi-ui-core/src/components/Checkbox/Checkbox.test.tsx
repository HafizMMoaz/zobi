import { render, screen, userEvent, waitFor } from '@zobi-ui/core/spec';
import { Checkbox } from '.';
import type { CheckboxProps } from './types';

const mockedProps: CheckboxProps = {
  checked: false,
  id: 'checkbox-id',
  onChange: jest.fn(),
  disabled: false,
  title: 'Checkbox title',
  indeterminate: false,
  children: 'Checkbox Label',
};

describe('Checkbox Component', () => {
  const asyncRender = (props = mockedProps) =>
    waitFor(() => render(<Checkbox {...props} />));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render correctly', async () => {
      const { container } = await asyncRender();
      expect(container).toBeInTheDocument();
    });

    test('should render the label', async () => {
      await asyncRender();
      expect(screen.getByText('Checkbox Label')).toBeInTheDocument();
    });

    test('should render the checkbox', async () => {
      await asyncRender();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    test('should render as unchecked when checked is false', async () => {
      await asyncRender();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    test('should render as checked when checked is true', async () => {
      const checkedProps = { ...mockedProps, checked: true };
      await asyncRender(checkedProps);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    test('should render as indeterminate when indeterminate is true', async () => {
      const indeterminateProps = { ...mockedProps, indeterminate: true };
      await asyncRender(indeterminateProps);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect((checkbox as HTMLInputElement).indeterminate).toBe(true);
    });

    test('should render as disabled when disabled prop is true', async () => {
      const disabledProps = { ...mockedProps, disabled: true };
      await asyncRender(disabledProps);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    test('should call the onChange handler when clicked', async () => {
      await asyncRender();
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      expect(mockedProps.onChange).toHaveBeenCalledTimes(1);
    });

    test('should not call the onChange handler when disabled and clicked', async () => {
      const mockOnChange = jest.fn();
      const disabledProps = {
        ...mockedProps,
        disabled: true,
        onChange: mockOnChange,
      };

      await asyncRender(disabledProps);
      const checkbox = screen.getByRole('checkbox');

      await userEvent.click(checkbox);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('calls onChange handler successfully', async () => {
      const mockAction = jest.fn();
      render(<Checkbox checked={false} onChange={mockAction} />);
      const checkboxInput = screen.getByRole('checkbox');
      await userEvent.click(checkboxInput);
      expect(mockAction).toHaveBeenCalled();
    });
  });
});
