import { render, screen } from 'spec/helpers/testing-library';
import type { TagType } from 'src/types/TagType';
import { Tag } from '.';

const mockedProps: TagType = {
  name: 'example-tag',
  id: 1,
  onDelete: undefined,
  editable: false,
  onClick: undefined,
};

const setup = (props: TagType = mockedProps) =>
  render(<Tag {...props} />, { useRouter: true });

test('should render', () => {
  const { container } = setup();
  expect(container).toBeInTheDocument();
});

test('should render shortname properly', () => {
  const { container } = setup();
  expect(container).toBeInTheDocument();
  expect(screen.getByTestId('tag')).toBeInTheDocument();
  expect(screen.getByTestId('tag')).toHaveTextContent(mockedProps.name || '');
});

test('should render longname properly', () => {
  const longNameProps = {
    ...mockedProps,
    name: 'very-long-tag-name-that-truncates',
  };
  const { container } = setup(longNameProps);
  expect(container).toBeInTheDocument();
  expect(screen.getByTestId('tag')).toBeInTheDocument();
  expect(screen.getByTestId('tag')).toHaveTextContent(
    `${longNameProps.name.slice(0, 20)}...`,
  );
});
