import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import ColorBreakpointOption from './ColorBreakpointOption';
import { ColorBreakpointType, ColorBreakpointOptionProps } from './types';

const mockBreakpoint: ColorBreakpointType = {
  id: 0,
  color: { r: 255, g: 0, b: 0, a: 1 },
  minValue: 0,
  maxValue: 100,
};

const mockBreakpoints: ColorBreakpointType[] = [mockBreakpoint];

const createProps = (): ColorBreakpointOptionProps => ({
  breakpoint: mockBreakpoint,
  colorBreakpoints: mockBreakpoints,
  index: 0,
  saveColorBreakpoint: jest.fn(),
  onClose: jest.fn(),
  onShift: jest.fn(),
});

const renderComponent = (props: Partial<ColorBreakpointOptionProps> = {}) =>
  render(<ColorBreakpointOption {...createProps()} {...props} />, {
    useDnd: true,
  });

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ColorBreakpointOption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render', async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(container).toBeInTheDocument());
  });

  test('should render the breakpoint range text', async () => {
    renderComponent();
    expect(await screen.findByText('0 - 100')).toBeInTheDocument();
  });

  test('should render the remove button', async () => {
    renderComponent();
    const removeBtn = await screen.findByTestId('remove-control-button');
    expect(removeBtn).toBeInTheDocument();
  });

  test('should render the color preview', async () => {
    renderComponent();
    const colorPreview = await screen.findByTestId('color-preview');
    expect(colorPreview).toBeInTheDocument();
  });

  test('should call onClose when remove button is clicked', async () => {
    const onClose = jest.fn();
    renderComponent({ onClose });

    const removeBtn = await screen.findByTestId('remove-control-button');
    userEvent.click(removeBtn);

    expect(onClose).toHaveBeenCalledWith(0);
  });

  test('should open popover when clicked', async () => {
    renderComponent();

    const breakpointOption = await screen.findByTestId(
      'color-breakpoint-trigger',
    );
    userEvent.click(breakpointOption);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('should render different color values correctly', async () => {
    const blueBreakpoint: ColorBreakpointType = {
      id: 1,
      color: { r: 0, g: 0, b: 255, a: 1 },
      minValue: 50,
      maxValue: 150,
    };

    renderComponent({ breakpoint: blueBreakpoint });
    expect(await screen.findByText('50 - 150')).toBeInTheDocument();

    const colorPreview = await screen.findByTestId('color-preview');
    expect(colorPreview).toBeInTheDocument();
  });

  test('should handle decimal values', async () => {
    const decimalBreakpoint: ColorBreakpointType = {
      id: 2,
      color: { r: 128, g: 128, b: 128, a: 1 },
      minValue: 0.5,
      maxValue: 99.9,
    };

    renderComponent({ breakpoint: decimalBreakpoint });
    expect(await screen.findByText('0.5 - 99.9')).toBeInTheDocument();
  });
});
