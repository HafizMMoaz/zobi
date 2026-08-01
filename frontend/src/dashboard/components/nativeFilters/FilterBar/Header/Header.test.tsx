import { render, screen, userEvent } from 'spec/helpers/testing-library';
import Header from './index';

const createProps = () => ({
  toggleFiltersBar: jest.fn(),
});

test('should render', () => {
  const mockedProps = createProps();
  const { container } = render(<Header {...mockedProps} />, { useRedux: true });
  expect(container).toBeInTheDocument();
});

test('should render the "Filters and controls" heading', () => {
  const mockedProps = createProps();
  render(<Header {...mockedProps} />, { useRedux: true });
  expect(screen.getByText('Filters and controls')).toBeInTheDocument();
});

test('should render the expand button', () => {
  const mockedProps = createProps();
  render(<Header {...mockedProps} />, { useRedux: true });
  expect(
    screen.getByRole('button', { name: 'vertical-align' }),
  ).toBeInTheDocument();
});

test('should toggle', () => {
  const mockedProps = createProps();
  render(<Header {...mockedProps} />, { useRedux: true });
  const expandBtn = screen.getByRole('button', {
    name: 'vertical-align',
  });
  expect(mockedProps.toggleFiltersBar).not.toHaveBeenCalled();
  userEvent.click(expandBtn);
  expect(mockedProps.toggleFiltersBar).toHaveBeenCalled();
});
