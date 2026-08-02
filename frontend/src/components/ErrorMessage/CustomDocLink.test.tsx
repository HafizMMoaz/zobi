import { render, screen } from 'spec/helpers/testing-library';
import { CustomDocLink } from './CustomDocLink';

const mockedProps = {
  url: 'https://zobi.dev/docs/',
  label: 'Zobi Docs',
};

test('should render the label', () => {
  render(<CustomDocLink {...mockedProps} />);
  expect(screen.getByText('Zobi Docs')).toBeInTheDocument();
});

test('should render the link with correct attributes', () => {
  render(<CustomDocLink {...mockedProps} />);
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', mockedProps.url);
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});
