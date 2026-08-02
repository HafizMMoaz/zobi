import { ErrorLevel, ErrorSource, ErrorTypeEnum } from '@zobi.dev/core';
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { ErrorMessageWithStackTrace } from './ErrorMessageWithStackTrace';
import { BasicErrorAlert } from './BasicErrorAlert';

jest.mock(
  '@zobi.dev/core/components/Icons/AsyncIcon',
  () =>
    ({ fileName }: { fileName: string }) => (
      <span role="img" aria-label={fileName.replace('_', '-')} />
    ),
);

const mockedProps = {
  level: 'warning' as ErrorLevel,
  link: 'https://sample.com',
  source: 'dashboard' as ErrorSource,
  stackTrace: 'Stacktrace',
};

test('should render', () => {
  const { container } = render(<ErrorMessageWithStackTrace {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should render the stacktrace', () => {
  render(<ErrorMessageWithStackTrace {...mockedProps} />, { useRedux: true });
  const button = screen.getByText('See more');
  userEvent.click(button);
  expect(screen.getByText('Stacktrace')).toBeInTheDocument();
});

test('should render the link', () => {
  render(<ErrorMessageWithStackTrace {...mockedProps} />, { useRedux: true });
  const button = screen.getByText('See more');
  userEvent.click(button);
  const link = screen.getByRole('link');
  expect(link).toHaveTextContent('Request Access');
  expect(link).toHaveAttribute('href', mockedProps.link);
});

test('should render a close button by default', () => {
  render(<ErrorMessageWithStackTrace {...mockedProps} />);
  expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
});

test('should not render a close button when closable is false', () => {
  render(<ErrorMessageWithStackTrace {...mockedProps} closable={false} />);
  expect(
    screen.queryByRole('button', { name: /close/i }),
  ).not.toBeInTheDocument();
});

test('should render the fallback', () => {
  const body = 'Blahblah';
  render(
    <ErrorMessageWithStackTrace
      error={{
        error_type: ErrorTypeEnum.FRONTEND_NETWORK_ERROR,
        message: body,
        extra: {},
        level: 'error',
      }}
      fallback={<BasicErrorAlert title="Blah" body={body} level="error" />}
      {...mockedProps}
    />,
    { useRedux: true },
  );
  expect(screen.getByText(body)).toBeInTheDocument();
});
