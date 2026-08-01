import { render, screen } from '@zobi.dev/core/spec';
import { List } from '.';
import type { ListProps } from './types';

const mockedProps: ListProps<any> = {
  dataSource: ['Item 1', 'Item 2', 'Item 3'],
  renderItem: item => <div>{item}</div>,
};

test('should render', () => {
  const { container } = render(<List {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should render the correct number of items', () => {
  render(<List {...mockedProps} />);

  const listItemElements = screen.getAllByText(/Item \d/);

  expect(listItemElements.length).toBe(3);
  listItemElements.forEach((item, index) => {
    expect(item).toHaveTextContent(`Item ${index + 1}`);
  });
});

test('should render List.Item with compact prop', () => {
  const { container } = render(<List.Item compact>Compact content</List.Item>);
  expect(container).toBeInTheDocument();
});

test('should render List.Item without compact prop', () => {
  const { container } = render(<List.Item>Regular content</List.Item>);
  expect(container).toBeInTheDocument();
});
