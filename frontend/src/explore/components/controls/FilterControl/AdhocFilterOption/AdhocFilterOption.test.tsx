import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import AdhocFilter from 'src/explore/components/controls/FilterControl/AdhocFilter';
import AdhocFilterOption, { AdhocFilterOptionProps } from '.';
import { Clauses, ExpressionTypes } from '../types';

const simpleAdhocFilter = new AdhocFilter({
  expressionType: ExpressionTypes.Simple,
  subject: 'value',
  operator: '>',
  comparator: '10',
  clause: Clauses.Where,
});

const options = [
  { type: 'VARCHAR(255)', column_name: 'source', id: 1 },
  { type: 'VARCHAR(255)', column_name: 'target', id: 2 },
  { type: 'DOUBLE', column_name: 'value', id: 3 },
];

const mockedProps = {
  adhocFilter: simpleAdhocFilter,
  onFilterEdit: jest.fn(),
  onRemoveFilter: jest.fn(),
  options,
  sections: [],
  operators: [],
  datasource: {},
  partitionColumn: '',
  onMoveLabel: jest.fn(),
  onDropLabel: jest.fn(),
  index: 1,
};

const setup = (props: AdhocFilterOptionProps) => (
  <AdhocFilterOption {...props} />
);

test('should render', async () => {
  const { container } = render(setup(mockedProps), {
    useDnd: true,
    useRedux: true,
  });
  await waitFor(() => expect(container).toBeInTheDocument());
});

test('should render the control label', async () => {
  render(setup(mockedProps), { useDnd: true, useRedux: true });
  expect(await screen.findByText('value > 10')).toBeInTheDocument();
});

test('should render the remove button', async () => {
  render(setup(mockedProps), { useDnd: true, useRedux: true });
  const removeBtn = await screen.findByRole('button');
  expect(removeBtn).toBeInTheDocument();
});

test('should render the right caret', async () => {
  render(setup(mockedProps), { useDnd: true, useRedux: true });
  expect(await screen.findByRole('img', { name: 'right' })).toBeInTheDocument();
});

test('should render the Popover on clicking the right caret', async () => {
  render(setup(mockedProps), { useDnd: true, useRedux: true });
  const rightCaret = await screen.findByRole('img', {
    name: 'right',
  });
  userEvent.click(rightCaret);
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
});
