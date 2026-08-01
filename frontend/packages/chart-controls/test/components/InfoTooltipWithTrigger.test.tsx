import '@testing-library/jest-dom';
import { fireEvent, render } from '@zobi.dev/core/spec';
import { InfoTooltip, InfoTooltipProps } from '@zobi.dev/core/components';

jest.mock('@zobi.dev/core/components/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-test="mock-tooltip">{children}</div>
  ),
}));

const defaultProps = {};

const setup = (props: Partial<InfoTooltipProps> = {}) =>
  render(<InfoTooltip {...defaultProps} {...props} />);

test('renders a tooltip', () => {
  const { getAllByTestId } = setup({
    label: 'test',
    tooltip: 'this is a test',
  });
  expect(getAllByTestId('mock-tooltip').length).toEqual(1);
});

test('responds to keydown events', () => {
  const clickHandler = jest.fn();
  const { getByRole } = setup({
    label: 'test',
    tooltip: 'this is a test',
    onClick: clickHandler,
  });

  fireEvent.keyDown(getByRole('button'), {
    key: 'Tab',
    code: 9,
    charCode: 9,
  });
  expect(clickHandler).toHaveBeenCalledTimes(0);

  fireEvent.keyDown(getByRole('button'), {
    key: 'Enter',
    code: 13,
    charCode: 13,
  });
  expect(clickHandler).toHaveBeenCalledTimes(1);

  fireEvent.keyDown(getByRole('button'), {
    key: ' ',
    code: 32,
    charCode: 32,
  });
  expect(clickHandler).toHaveBeenCalledTimes(2);
});

test('finds the info circle icon inside info variant', () => {
  const { container } = setup({
    type: 'info',
  });

  const iconSpan = container.querySelector('svg[data-icon="info-circle"]');
  expect(iconSpan).toBeInTheDocument();
});

test('finds the warning icon inside warning variant', () => {
  const { container } = setup({
    type: 'warning',
  });

  const iconSpan = container.querySelector('svg[data-icon="warning"]');
  expect(iconSpan).toBeInTheDocument();
});

test('finds the close circle icon inside error variant', () => {
  const { container } = setup({
    type: 'error',
  });

  const iconSpan = container.querySelector('svg[data-icon="close-circle"]');
  expect(iconSpan).toBeInTheDocument();
});

test('finds the question circle icon inside question variant', () => {
  const { container } = setup({
    type: 'question',
  });

  const iconSpan = container.querySelector('svg[data-icon="question-circle"]');
  expect(iconSpan).toBeInTheDocument();
});

test('finds the thunderbolt icon inside notice variant', () => {
  const { container } = setup({
    type: 'notice',
  });

  const iconSpan = container.querySelector('svg[data-icon="thunderbolt"]');
  expect(iconSpan).toBeInTheDocument();
});
