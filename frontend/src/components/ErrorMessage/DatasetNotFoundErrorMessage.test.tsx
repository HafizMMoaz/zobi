import { ErrorLevel, ErrorSource, ErrorTypeEnum } from '@zobi.dev/core';
import { render, screen } from 'spec/helpers/testing-library';
import { DatasetNotFoundErrorMessage } from './DatasetNotFoundErrorMessage';

jest.mock(
  '@zobi.dev/core/components/Icons/AsyncIcon',
  () =>
    ({ fileName }: { fileName: string }) => (
      <span role="img" aria-label={fileName.replace('_', '-')} />
    ),
);

const mockedProps = {
  error: {
    error_type: ErrorTypeEnum.FAILED_FETCHING_DATASOURCE_INFO_ERROR,
    level: 'error' as ErrorLevel,
    message: 'The dataset associated with this chart no longer exists',
    extra: {},
  },
  source: 'dashboard' as ErrorSource,
};

test('should render', () => {
  const { container } = render(
    <DatasetNotFoundErrorMessage {...mockedProps} />,
  );
  expect(container).toBeInTheDocument();
});

test('should render the default title', () => {
  render(<DatasetNotFoundErrorMessage {...mockedProps} />);
  expect(screen.getByText('Missing dataset')).toBeInTheDocument();
});
