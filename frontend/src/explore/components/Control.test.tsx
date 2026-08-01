import { render, screen, waitFor } from 'spec/helpers/testing-library';
import Control, { ControlProps } from 'src/explore/components/Control';

const defaultProps: ControlProps = {
  type: 'CheckboxControl',
  name: 'checkbox',
  value: true,
  actions: {
    setControlValue: jest.fn(),
  },
};

const setup = (overrides = {}) => <Control {...defaultProps} {...overrides} />;

test('render a control', () => {
  render(setup());

  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();
});

test('render null if type is not exit', () => {
  render(
    setup({
      type: undefined,
    }),
  );
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

test('render null if type is not valid', () => {
  render(
    setup({
      type: 'UnknownControl',
    }),
  );
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

test('render null if isVisible is false', () => {
  render(
    setup({
      isVisible: false,
    }),
  );
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

test('call setControlValue if isVisible is false', async () => {
  const { rerender } = render(
    setup({
      isVisible: true,
      default: false,
    }),
  );
  expect(defaultProps.actions.setControlValue).not.toHaveBeenCalled();
  rerender(setup({ isVisible: false, default: false }));
  await waitFor(() =>
    expect(defaultProps.actions.setControlValue).toHaveBeenCalled(),
  );
});
