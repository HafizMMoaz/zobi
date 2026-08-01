
import { screen, fireEvent, render } from 'spec/helpers/testing-library';
import { ErrorAlert } from './ErrorAlert';

// ErrorAlert
test('ErrorAlert renders the error message correctly', () => {
  render(
    <ErrorAlert
      errorType="Error"
      message="Something went wrong"
      type="error"
    />,
  );

  expect(screen.getByText('Error')).toBeInTheDocument();
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});

test('ErrorAlert renders the description when provided', () => {
  const description = 'This is a detailed description';
  render(
    <ErrorAlert
      errorType="Error"
      message="Something went wrong"
      type="error"
      description={description}
    />,
  );

  expect(screen.getByText(description)).toBeInTheDocument();
});

test('ErrorAlert toggles description details visibility when show more/less is clicked', () => {
  const descriptionDetails = 'Additional details about the error.';
  render(
    <ErrorAlert
      errorType="Error"
      message="Something went wrong"
      type="error"
      descriptionDetails={descriptionDetails}
      descriptionDetailsCollapsed
    />,
  );

  const showMoreButton = screen.getByText('See more');
  expect(showMoreButton).toBeInTheDocument();

  fireEvent.click(showMoreButton);
  expect(screen.getByText(descriptionDetails)).toBeInTheDocument();

  const showLessButton = screen.getByText('See less');
  fireEvent.click(showLessButton);
  expect(screen.queryByText(descriptionDetails)).not.toBeInTheDocument();
});

test('ErrorAlert renders compact mode with a tooltip and modal', () => {
  render(
    <ErrorAlert
      errorType="Error"
      message="Compact mode example"
      type="error"
      compact
      descriptionDetails="Detailed description in compact mode."
    />,
  );

  const iconTrigger = screen.getByText('Error');
  expect(iconTrigger).toBeInTheDocument();

  fireEvent.click(iconTrigger);
  expect(screen.getByText('Compact mode example')).toBeInTheDocument();
});
