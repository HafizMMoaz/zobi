import { render, screen } from 'spec/helpers/testing-library';
import { OwnerSelectLabel } from '.';

test('renders name and email', () => {
  render(OwnerSelectLabel({ name: 'John Doe', email: 'jdoe@example.com' }));
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('jdoe@example.com')).toBeInTheDocument();
});

test('renders only name when email is undefined', () => {
  render(OwnerSelectLabel({ name: 'Jane Smith' }));
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});

test('renders only name when email is empty string', () => {
  render(OwnerSelectLabel({ name: 'Jane Smith', email: '' }));
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  const container = screen.getByText('Jane Smith').parentElement;
  expect(container?.children).toHaveLength(1);
});
