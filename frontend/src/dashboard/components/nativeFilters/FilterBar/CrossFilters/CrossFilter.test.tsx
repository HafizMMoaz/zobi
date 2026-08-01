import { render, screen } from 'spec/helpers/testing-library';
import { FilterBarOrientation } from 'src/dashboard/types';
import { IndicatorStatus } from '../../selectors';
import CrossFilter from './CrossFilter';

const mockedProps = {
  filter: {
    name: 'test',
    emitterId: 1,
    column: 'country_name',
    value: 'Italy',
    status: IndicatorStatus.CrossFilterApplied,
    path: ['test-path'],
  },
  orientation: FilterBarOrientation.Horizontal,
  last: false,
};

const setup = (props: typeof mockedProps) =>
  render(<CrossFilter {...props} />, {
    useRedux: true,
  });

test('CrossFilter should render', () => {
  const { container } = setup(mockedProps);
  expect(container).toBeInTheDocument();
});

test('Title should render', () => {
  setup(mockedProps);
  expect(screen.getByText('test')).toBeInTheDocument();
});

test('Search icon should be visible', () => {
  setup(mockedProps);
  expect(
    screen.getByTestId('cross-filters-highlight-emitter'),
  ).toBeInTheDocument();
});

test('Column and value should be visible', () => {
  setup(mockedProps);
  expect(screen.getByText('country_name')).toBeInTheDocument();
  expect(screen.getByText('Italy')).toBeInTheDocument();
});

test('Tag should be closable', () => {
  setup(mockedProps);
  expect(screen.getByRole('img', { name: 'Close' })).toBeInTheDocument();
});

test('Divider should not be visible', () => {
  setup(mockedProps);
  expect(screen.queryByTestId('cross-filters-divider')).not.toBeInTheDocument();
});

test('Divider should be visible', () => {
  setup({
    ...mockedProps,
    last: true,
  });
  expect(screen.getByTestId('cross-filters-divider')).toBeInTheDocument();
});
