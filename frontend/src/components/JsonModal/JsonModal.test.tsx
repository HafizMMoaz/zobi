import { fireEvent, render } from 'spec/helpers/testing-library';
import { JsonModal } from '.';
import { convertBigIntStrToNumber } from './utils';

jest.mock('react-json-tree', () => ({
  JSONTree: () => <div data-test="mock-json-tree" />,
}));

test('renders JSON object in a tree view in a modal', () => {
  const jsonData = { a: 1 };
  const jsonValue = JSON.stringify(jsonData);
  const { getByText, getByTestId, queryByTestId } = render(
    <JsonModal
      jsonObject={jsonData}
      jsonValue={jsonValue}
      modalTitle="title"
    />,
    {
      useRedux: true,
    },
  );
  expect(queryByTestId('mock-json-tree')).not.toBeInTheDocument();
  const link = getByText(jsonValue);
  fireEvent.click(link);
  expect(getByTestId('mock-json-tree')).toBeInTheDocument();
});

test('renders an object in a tree view in a modal', () => {
  const jsonData = { a: 1 };
  const expected = JSON.stringify(jsonData);
  const { getByText, getByTestId, queryByTestId } = render(
    <JsonModal jsonObject={jsonData} jsonValue={jsonData} modalTitle="title" />,
    {
      useRedux: true,
    },
  );
  expect(queryByTestId('mock-json-tree')).not.toBeInTheDocument();
  const link = getByText(expected);
  fireEvent.click(link);
  expect(getByTestId('mock-json-tree')).toBeInTheDocument();
});

test('renders bigInt value in a number format', () => {
  expect(convertBigIntStrToNumber('123')).toBe('123');
  expect(convertBigIntStrToNumber('some string value')).toBe(
    'some string value',
  );
  expect(convertBigIntStrToNumber('{ a: 123 }')).toBe('{ a: 123 }');
  expect(convertBigIntStrToNumber('"Not a Number"')).toBe('"Not a Number"');
  // trim quotes for bigint string format
  expect(convertBigIntStrToNumber('"-12345678901234567890"')).toBe(
    '-12345678901234567890',
  );
  expect(convertBigIntStrToNumber('"12345678901234567890"')).toBe(
    '12345678901234567890',
  );
});
