import { ErrorLevel, ErrorSource, ErrorTypeEnum } from '@zobi.dev/core';
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { FrontendNetworkErrorMessage } from './FrontendNetworkErrorMessage';

jest.mock(
  '@zobi.dev/core/components/Icons/AsyncIcon',
  () =>
    ({ fileName }: { fileName: string }) => (
      <span role="img" aria-label={fileName.replace('_', '-')} />
    ),
);

const mockedProps = {
  error: {
    error_type: ErrorTypeEnum.FRONTEND_NETWORK_ERROR,
    extra: {},
    level: 'error' as ErrorLevel,
    message: 'Error message',
  },
  source: 'dashboard' as ErrorSource,
  subtitle: 'Error message',
};

test('should render', () => {
  const nullExtraProps = {
    ...mockedProps,
    error: {
      ...mockedProps.error,
      extra: null,
    },
  };
  const { container } = render(
    <FrontendNetworkErrorMessage {...nullExtraProps} />,
  );
  expect(container).toBeInTheDocument();
});

test('should render the error message', () => {
  render(<FrontendNetworkErrorMessage {...mockedProps} />, { useRedux: true });
  expect(screen.getByText('Error message')).toBeInTheDocument();
});

test("should render error message in compact mode if 'compact' is true", () => {
  render(<FrontendNetworkErrorMessage {...mockedProps} compact />, {
    useRedux: true,
  });
  expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Error message')).toBeInTheDocument();
});
