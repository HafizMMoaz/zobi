import { render, screen } from '@zobi.dev/core/spec';
import { Switch } from '.';

const mockedProps = {
  label: 'testLabel',
  dataTest: 'dataTest',
  checked: false,
};

test('should render', () => {
  const { container } = render(<Switch {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should have the correct checked prop', () => {
  render(<Switch {...mockedProps} />);

  const switchElement = screen.getByRole('switch');

  expect(switchElement).toBeInTheDocument();
  expect(switchElement).not.toBeChecked();
});
