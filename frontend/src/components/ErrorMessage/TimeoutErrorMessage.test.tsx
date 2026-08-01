
import { ErrorSource, ErrorTypeEnum, ErrorLevel } from '@zobi.dev/core';
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { TimeoutErrorMessage } from './TimeoutErrorMessage';

jest.mock(
  '@zobi.dev/core/components/Icons/AsyncIcon',
  () =>
    ({ fileName }: { fileName: string }) => (
      <span role="img" aria-label={fileName.replace('_', '-')} />
    ),
);

const mockedProps = {
  error: {
    error_type: ErrorTypeEnum.FRONTEND_TIMEOUT_ERROR,
    extra: {
      issue_codes: [
        {
          code: 1,
          message: 'Issue code message A',
        },
        {
          code: 2,
          message: 'Issue code message B',
        },
      ],
      owners: ['Owner A', 'Owner B'],
      timeout: 30,
    },
    level: 'error' as ErrorLevel,
    message: 'Error message',
  },
  source: 'dashboard' as ErrorSource,
};

test('should render', () => {
  const { container } = render(<TimeoutErrorMessage {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should render the default title', () => {
  render(<TimeoutErrorMessage {...mockedProps} />);
  expect(screen.getByText('Timeout error')).toBeInTheDocument();
});

test('should render the issue codes', () => {
  render(<TimeoutErrorMessage {...mockedProps} />, { useRedux: true });
  const button = screen.getByText('See more');
  userEvent.click(button);
  expect(screen.getByText(/This may be triggered by:/)).toBeInTheDocument();
  expect(screen.getByText(/Issue code message A/)).toBeInTheDocument();
  expect(screen.getByText(/Issue code message B/)).toBeInTheDocument();
});

test('should render the owners', () => {
  render(<TimeoutErrorMessage {...mockedProps} />, { useRedux: true });
  const button = screen.getByText('See more');
  userEvent.click(button);
  expect(
    screen.getByText('Please reach out to the Chart Owners for assistance.'),
  ).toBeInTheDocument();
  expect(
    screen.getByText('Chart Owners: Owner A, Owner B'),
  ).toBeInTheDocument();
});

test('should NOT render the owners', () => {
  const noVisualizationProps = {
    ...mockedProps,
    source: 'sqllab' as ErrorSource,
  };
  render(<TimeoutErrorMessage {...noVisualizationProps} />, {
    useRedux: true,
  });
  const button = screen.getByText('See more');
  userEvent.click(button);
  expect(
    screen.queryByText('Chart Owners: Owner A, Owner B'),
  ).not.toBeInTheDocument();
});

test('should render the timeout message', () => {
  render(<TimeoutErrorMessage {...mockedProps} />, { useRedux: true });
  const button = screen.getByText('See more');
  userEvent.click(button);
  expect(
    screen.getByText(
      /We’re having trouble loading this visualization. Queries are set to timeout after 30 seconds./,
    ),
  ).toBeInTheDocument();
});
