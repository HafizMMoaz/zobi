import { render, fireEvent, screen } from '@zobi.dev/core/spec';
import type { LabeledErrorBoundInputProps } from './types';
import { LabeledErrorBoundInput } from './LabeledErrorBoundInput';

const defaultProps: LabeledErrorBoundInputProps = {
  id: '1',
  label: 'Username',
  name: 'Username',
  validationMethods: { onBlur: () => {} },
  errorMessage: '',
  helpText: 'This is a line of example help text',
  hasTooltip: false,
  tooltipText: 'This is a tooltip',
  value: '',
  placeholder: 'Example placeholder text...',
  type: 'textbox',
};

describe('LabeledErrorBoundInput', () => {
  test('renders a LabeledErrorBoundInput normally, without an error', () => {
    render(<LabeledErrorBoundInput {...defaultProps} />);

    const label = screen.getByText(/username/i);
    const textboxInput = screen.getByRole('textbox');
    const helperText = screen.getByText('This is a line of example help text');

    expect(label).toBeVisible();
    expect(textboxInput).toBeVisible();
    expect(helperText).toBeVisible();
  });

  test('renders a LabeledErrorBoundInput with an error', () => {
    // Pass an error into props, causing errorText to replace helperText
    defaultProps.errorMessage = 'Example error message';
    render(<LabeledErrorBoundInput {...defaultProps} />);

    const label = screen.getByText(/username/i);
    const textboxInput = screen.getByRole('textbox');
    const errorText = screen.getByText(/example error message/i);

    expect(label).toBeVisible();
    expect(textboxInput).toBeVisible();
    expect(errorText).toBeVisible();
  });
  test('renders a LabeledErrorBoundInput with a InfoTooltip', async () => {
    defaultProps.hasTooltip = true;
    render(<LabeledErrorBoundInput {...defaultProps} />);

    const label = screen.getByText(/username/i);
    const textboxInput = screen.getByRole('textbox');
    const tooltipIcon = screen.getAllByRole('img')[0];

    fireEvent.mouseOver(tooltipIcon);

    expect(tooltipIcon).toBeVisible();
    expect(label).toBeVisible();
    expect(textboxInput).toBeVisible();
    expect(await screen.findByText('This is a tooltip')).toBeInTheDocument();
  });

  test('becomes a password input if visibilityToggle prop is passed in', async () => {
    defaultProps.visibilityToggle = true;
    render(<LabeledErrorBoundInput {...defaultProps} />);

    expect(await screen.findByTestId('icon-eye')).toBeVisible();
  });

  test('becomes a password input if props.name === password (backwards compatibility)', async () => {
    defaultProps.name = 'password';
    render(<LabeledErrorBoundInput {...defaultProps} />);

    expect(await screen.findByTestId('icon-eye')).toBeVisible();
  });
});
