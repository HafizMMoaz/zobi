import fetchMock from 'fetch-mock';
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import SelectAsyncControl from '.';

const datasetsOwnersEndpoint = 'glob:*/api/v1/dataset/related/owners*';

jest.mock('@zobi-ui/core/components/Select/Select', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-test="select-test"
      data-value={JSON.stringify(props.value)}
      data-placeholder={props.placeholder}
      data-multi={props.mode}
    >
      <button
        type="button"
        onClick={() => props.onChange(props.multi ? [] : {})}
      >
        onChange
      </button>
      <button type="button" onClick={() => props.mutator()}>
        mutator
      </button>
    </div>
  ),
  propertyComparator: jest.fn(),
}));

fetchMock.get(datasetsOwnersEndpoint, {
  result: [],
});

const createProps = () => ({
  ariaLabel: 'SelectAsyncControl',
  value: [],
  dataEndpoint: datasetsOwnersEndpoint,
  multi: true,
  placeholder: 'Select ...',
  onChange: jest.fn(),
  mutator: jest.fn(),
});

beforeEach(() => {
  jest.resetAllMocks();
});

test('Should render', async () => {
  const props = createProps();
  render(<SelectAsyncControl {...props} />, { useRedux: true });
  expect(await screen.findByTestId('select-test')).toBeInTheDocument();
});

test('Should send correct props to Select component - value props', async () => {
  const props = createProps();
  render(<SelectAsyncControl {...props} />, { useRedux: true });

  expect(await screen.findByTestId('select-test')).toHaveAttribute(
    'data-value',
    JSON.stringify(props.value),
  );
  expect(screen.getByTestId('select-test')).toHaveAttribute(
    'data-placeholder',
    props.placeholder,
  );
  expect(screen.getByTestId('select-test')).toHaveAttribute(
    'data-multi',
    'multiple',
  );
});

test('Should send correct props to Select component - function onChange multi:true', async () => {
  const props = createProps();
  render(<SelectAsyncControl {...props} />, { useRedux: true });
  expect(props.onChange).toHaveBeenCalledTimes(0);
  userEvent.click(await screen.findByText('onChange'));
  expect(props.onChange).toHaveBeenCalledTimes(1);
});

test('Should send correct props to Select component - function onChange multi:false', async () => {
  const props = createProps();
  render(<SelectAsyncControl {...{ ...props, multi: false }} />, {
    useRedux: true,
  });
  expect(props.onChange).toHaveBeenCalledTimes(0);
  userEvent.click(await screen.findByText('onChange'));
  expect(props.onChange).toHaveBeenCalledTimes(1);
});
