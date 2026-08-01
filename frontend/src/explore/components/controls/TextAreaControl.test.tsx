import {
  fireEvent,
  render,
  screen,
  waitFor,
} from 'spec/helpers/testing-library';

import TextAreaControl from 'src/explore/components/controls/TextAreaControl';

const defaultProps = {
  name: 'x_axis_label',
  label: 'X Axis Label',
  onChange: jest.fn(),
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('TextArea', () => {
  test('renders a FormControl', () => {
    render(<TextAreaControl {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeVisible();
  });

  test('calls onChange when toggled', () => {
    render(<TextAreaControl {...defaultProps} />);
    const textArea = screen.getByRole('textbox');
    fireEvent.change(textArea, { target: { value: 'x' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('x');
  });

  test('renders a AceEditor when language is specified', async () => {
    const props = { ...defaultProps, language: 'markdown' };
    const { container } = render(<TextAreaControl {...props} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelector('.ace_text-input')).toBeInTheDocument();
    });
  });

  test('calls onAreaEditorChange when entering in the AceEditor', () => {
    const props = { ...defaultProps, language: 'markdown' };
    render(<TextAreaControl {...props} />);
    const textArea = screen.getByRole('textbox');
    fireEvent.change(textArea, { target: { value: 'x' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('x');
  });
});
