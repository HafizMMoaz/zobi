import { render } from '@zobi.dev/core/spec';
import { IconTooltip } from '.';

jest.mock('@zobi.dev/core/components/Tooltip', () => ({
  Tooltip: () => <div data-test="mock-tooltip" />,
}));

const mockedProps = {
  tooltip: 'This is a tooltip',
};
test('renders', () => {
  const { container } = render(<IconTooltip>TEST</IconTooltip>);
  expect(container).toBeInTheDocument();
});
test('renders with props', () => {
  const { container } = render(
    <IconTooltip {...mockedProps}>TEST</IconTooltip>,
  );
  expect(container).toBeInTheDocument();
});
test('renders a tooltip', () => {
  const { getByTestId } = render(
    <IconTooltip {...mockedProps}>TEST</IconTooltip>,
  );
  expect(getByTestId('mock-tooltip')).toBeInTheDocument();
});
