import { fireEvent, render, screen } from '@zobi-ui/core/spec';

import { LastUpdated } from '.';

const updatedAt = new Date('Sat Dec 12 2020 00:00:00 GMT-0800');

test('renders the base component (no refresh)', () => {
  const { getByText } = render(<LastUpdated updatedAt={updatedAt} />);
  expect(getByText(/^Last Updated .+$/)).toBeInTheDocument();
});

test('renders a refresh action', () => {
  const mockAction = jest.fn();
  render(<LastUpdated updatedAt={updatedAt} update={mockAction} />);

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(mockAction).toHaveBeenCalled();
});
