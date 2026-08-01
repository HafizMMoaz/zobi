import { render } from 'spec/helpers/testing-library';
import { renderResultCell } from './utils';

jest.mock('src/components/JsonModal', () => ({
  ...jest.requireActual('src/components/JsonModal'),
  JsonModal: () => <div data-test="mock-json-modal" />,
}));

const unexpectedGetCellContent = () => 'none';

test('should render NULL for null cell data', () => {
  const { container } = render(
    <>
      {renderResultCell({
        cellData: null,
        columnKey: 'column1',
        getCellContent: unexpectedGetCellContent,
      })}
    </>,
  );
  expect(container).toHaveTextContent('NULL');
});

test('should render JsonModal for json cell data', () => {
  const { getByTestId } = render(
    <>
      {renderResultCell({
        cellData: '{ "a": 1 }',
        columnKey: 'a',
        getCellContent: unexpectedGetCellContent,
      })}
    </>,
  );
  expect(getByTestId('mock-json-modal')).toBeInTheDocument();
});

test('should render cellData value for default cell data', () => {
  const { container } = render(
    <>
      {renderResultCell({
        cellData: 'regular_text',
        columnKey: 'a',
      })}
    </>,
  );
  expect(container).toHaveTextContent('regular_text');
});

test('should transform cell data by getCellContent for the regular text', () => {
  const { container } = render(
    <>
      {renderResultCell({
        cellData: 'regular_text',
        columnKey: 'a',
        getCellContent: ({ cellData, columnKey }) => `${cellData}:${columnKey}`,
      })}
    </>,
  );
  expect(container).toHaveTextContent('regular_text:a');
});
