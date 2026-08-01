import { render, screen, fireEvent } from '@zobi.dev/core/spec';
import { IconButton } from '.';

const defaultProps = {
  buttonText: 'This is the IconButton text',
  icon: '/images/icons/sql.svg',
};

describe('IconButton', () => {
  test('renders an IconButton with icon and text', () => {
    render(<IconButton {...defaultProps} />);

    const icon = screen.getByRole('img');
    const buttonText = screen.getByText(/this is the iconbutton text/i);

    expect(icon).toBeVisible();
    expect(buttonText).toBeVisible();
  });

  test('is keyboard accessible and has correct aria attributes', () => {
    render(<IconButton {...defaultProps} />);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('tabIndex', '0');
    expect(button).toHaveAttribute('aria-label', defaultProps.buttonText);
  });

  test('handles Enter and Space key presses', () => {
    const mockOnClick = jest.fn();
    render(<IconButton {...defaultProps} onClick={mockOnClick} />);

    const button = screen.getByRole('button');

    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  test('uses custom alt text when provided', () => {
    const customAltText = 'Custom Alt Text';
    render(
      <IconButton
        buttonText="Custom Alt Text Button"
        icon="/images/icons/sql.svg"
        altText={customAltText}
      />,
    );

    const icon = screen.getByAltText(customAltText);
    expect(icon).toBeVisible();
  });

  test('displays tooltip with button text', () => {
    render(<IconButton {...defaultProps} />);

    const tooltipTrigger = screen.getByText(/this is the iconbutton text/i);
    expect(tooltipTrigger).toBeVisible();
  });

  test('calls onClick handler when clicked', () => {
    const mockOnClick = jest.fn();
    render(<IconButton {...defaultProps} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
