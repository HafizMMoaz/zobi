import { render, screen, userEvent } from 'spec/helpers/testing-library';
import CheckboxControl from 'src/explore/components/controls/CheckboxControl';

const defaultProps = {
  name: 'show_legend',
  onChange: jest.fn(),
  value: false,
  label: 'checkbox label',
};

const setup = (overrides = {}) => (
  <CheckboxControl {...defaultProps} {...overrides} />
);

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('CheckboxControl', () => {
  test('renders a Checkbox', () => {
    render(setup());

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  test('Checks the box when the label is clicked', () => {
    render(setup());
    const label = screen.getByRole('button', {
      name: /checkbox label/i,
    });

    userEvent.click(label);
    expect(defaultProps.onChange).toHaveBeenCalled();
  });
});
