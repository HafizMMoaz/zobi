import { render, screen } from 'spec/helpers/testing-library';

import { CopyButton } from '.';

test('Render a button', () => {
  render(<CopyButton>btn</CopyButton>);
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByRole('button')).toHaveClass('zobi-button');
});
