import { render, screen, userEvent } from '@zobi.dev/core/spec';
import PopoverDropdown, {
  PopoverDropdownProps,
  OptionProps,
} from '@zobi.dev/core/components/PopoverDropdown';

const defaultProps: PopoverDropdownProps = {
  id: 'popover-dropdown',
  options: [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ],
  value: '1',
  renderButton: (option: OptionProps) => <span>{option.label}</span>,
  renderOption: (option: OptionProps) => <div>{option.label}</div>,
  onChange: jest.fn(),
};

test('renders with default props', async () => {
  render(<PopoverDropdown {...defaultProps} />);
  expect(await screen.findByRole('button')).toBeInTheDocument();
  expect(screen.getByRole('button')).toHaveTextContent('Option 1');
});

test('renders the menu on click', async () => {
  render(<PopoverDropdown {...defaultProps} />);
  await userEvent.click(screen.getByRole('button'));
  expect(await screen.findByRole('menu')).toBeInTheDocument();
});

test('renders with custom button', async () => {
  render(
    <PopoverDropdown
      {...defaultProps}
      renderButton={({ label, value }: OptionProps) => (
        <button type="button" key={value}>
          {`Custom ${label}`}
        </button>
      )}
    />,
  );
  expect(await screen.findByText('Custom Option 1')).toBeInTheDocument();
});

test('renders with custom option', async () => {
  render(
    <PopoverDropdown
      {...defaultProps}
      renderOption={({ label, value }: OptionProps) => (
        <button type="button" key={value}>
          {`Custom ${label}`}
        </button>
      )}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(await screen.findByText('Custom Option 1')).toBeInTheDocument();
});

test('triggers onChange', async () => {
  render(<PopoverDropdown {...defaultProps} />);
  await userEvent.click(screen.getByRole('button'));
  expect(await screen.findByText('Option 2')).toBeInTheDocument();
  await userEvent.click(screen.getByText('Option 2'));
  expect(defaultProps.onChange).toHaveBeenCalled();
});
