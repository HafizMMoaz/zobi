import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { Indicator } from 'src/dashboard/components/nativeFilters/selectors';
import FilterIndicator from '.';

const createProps = () => ({
  indicator: {
    column: 'product_category',
    name: 'Vaccine Approach',
    value: [] as any[],
    path: [
      'ROOT_ID',
      'TABS-wUKya7eQ0Z',
      'TAB-BCIJF4NvgQ',
      'ROW-xSeNAspgw',
      'CHART-eirDduqb1A',
    ],
  } as Indicator,
  onClick: jest.fn(),
});

test('Should render', () => {
  const props = createProps();
  render(<FilterIndicator {...props} />);

  expect(
    screen.getByRole('button', { name: 'search Vaccine Approach' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('img')).toBeInTheDocument();
});

test('Should call "onClick"', () => {
  const props = createProps();
  render(<FilterIndicator {...props} />);

  expect(props.onClick).toHaveBeenCalledTimes(0);
  userEvent.click(
    screen.getByRole('button', { name: 'search Vaccine Approach' }),
  );
  expect(props.onClick).toHaveBeenCalledTimes(1);
});

test('Should render "value"', () => {
  const props = createProps();
  props.indicator.value = ['any', 'string'];
  render(<FilterIndicator {...props} />);

  expect(
    screen.getByRole('button', {
      name: 'search Vaccine Approach: any, string',
    }),
  ).toBeInTheDocument();
});

test('Should render with default props', () => {
  const props = createProps();
  delete props.indicator.path;
  render(<FilterIndicator indicator={props.indicator} />);

  expect(
    screen.getByRole('button', { name: 'Vaccine Approach' }),
  ).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Vaccine Approach' }));
});
