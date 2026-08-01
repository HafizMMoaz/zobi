import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { FilterBarOrientation } from 'src/dashboard/types';
import { CrossFilterIndicator, IndicatorStatus } from '../../selectors';
import CrossFilterTag from './CrossFilterTag';

const mockedProps: {
  filter: CrossFilterIndicator;
  orientation: FilterBarOrientation;
  removeCrossFilter: (filterId: number) => void;
  onClick?: () => void;
} = {
  filter: {
    name: 'test',
    emitterId: 1,
    column: 'country_name',
    value: 'Italy',
    status: IndicatorStatus.CrossFilterApplied,
    path: ['test-path'],
  },
  orientation: FilterBarOrientation.Horizontal,
  removeCrossFilter: jest.fn(),
};

const setup = (props: typeof mockedProps) =>
  render(<CrossFilterTag {...props} />, {
    useRedux: true,
  });

test('CrossFilterTag should render', () => {
  const { container } = setup(mockedProps);
  expect(container).toBeInTheDocument();
});

test('CrossFilterTag with adhoc column should render', () => {
  const props = {
    ...mockedProps,
    filter: {
      ...mockedProps.filter,
      column: {
        label: 'My column',
        sqlExpression: 'country_name',
        expressionType: 'SQL' as const,
      },
    },
  };

  const { container } = setup(props);
  expect(container).toBeInTheDocument();
  expect(screen.getByText('My column')).toBeInTheDocument();
  expect(screen.getByText('Italy')).toBeInTheDocument();
});

test('Column and value should be visible', () => {
  setup(mockedProps);
  expect(screen.getByText('country_name')).toBeInTheDocument();
  expect(screen.getByText('Italy')).toBeInTheDocument();
});

test('Tag should be closable', () => {
  setup(mockedProps);
  const close = screen.getByLabelText('Close');
  expect(close).toBeInTheDocument();
  userEvent.click(close);
  expect(mockedProps.removeCrossFilter).toHaveBeenCalledWith(1);
});

test('Close icon should have role="button"', () => {
  setup({
    ...mockedProps,
    onClick: jest.fn(),
  });
  const button = screen.getByLabelText('Close');
  expect(button).toBeInTheDocument();
});
