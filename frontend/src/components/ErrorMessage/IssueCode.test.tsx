import { render, screen } from 'spec/helpers/testing-library';
import { IssueCode } from './IssueCode';

const mockedProps = {
  code: 1,
  message: 'Error message',
};

test('should render', () => {
  const { container } = render(<IssueCode {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should render the message', () => {
  render(<IssueCode {...mockedProps} />);
  expect(screen.getByText('Error message')).toBeInTheDocument();
});

test('should render the link', () => {
  render(<IssueCode {...mockedProps} />);
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute(
    'href',
    `https://zobi.dev/docs/using-zobi/issue-codes#issue-${mockedProps.code}`,
  );
});
