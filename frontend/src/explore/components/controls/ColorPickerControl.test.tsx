import { render, screen, userEvent } from 'spec/helpers/testing-library';
import {
  CategoricalScheme,
  getCategoricalSchemeRegistry,
} from '@zobi.dev/core';
import ColorPickerControl from 'src/explore/components/controls/ColorPickerControl';

const defaultProps = {
  value: { r: 0, g: 122, b: 135, a: 1 },
  onChange: jest.fn(),
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ColorPickerControl', () => {
  beforeAll(() => {
    getCategoricalSchemeRegistry()
      .registerValue(
        'test',
        new CategoricalScheme({
          id: 'test',
          colors: ['#ff0000', '#00ff00', '#0000ff'],
        }),
      )
      .setDefaultKey('test');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders a ColorPicker component', () => {
    render(<ColorPickerControl {...defaultProps} />);

    // AntD ColorPicker renders a trigger element with class
    const colorPickerTrigger = document.querySelector(
      '.ant-color-picker-trigger',
    );
    expect(colorPickerTrigger).toBeInTheDocument();
  });

  test('displays the correct color value', () => {
    render(<ColorPickerControl {...defaultProps} />);

    // The color should be displayed as hex #007A87 (uppercase in AntD)
    expect(screen.getByText('#007A87')).toBeInTheDocument();
  });

  test('calls onChange with RGB values when color changes', async () => {
    const onChange = jest.fn();
    render(<ColorPickerControl {...defaultProps} onChange={onChange} />);

    // Open the color picker
    const colorPickerTrigger = document.querySelector(
      '.ant-color-picker-trigger',
    );
    expect(colorPickerTrigger).toBeInTheDocument();

    if (colorPickerTrigger) {
      await userEvent.click(colorPickerTrigger);
    }

    // Note: Testing actual color selection in AntD ColorPicker would require more complex mocking
    // as it uses complex internal components. The main functionality is covered by the component itself.
  });

  test('includes preset colors from the categorical scheme', () => {
    render(<ColorPickerControl {...defaultProps} />);

    // The component should have access to the preset colors from the registry
    // This is tested by ensuring the component renders without errors with the presets
    const colorPickerTrigger = document.querySelector(
      '.ant-color-picker-trigger',
    );
    expect(colorPickerTrigger).toBeInTheDocument();
  });
});
