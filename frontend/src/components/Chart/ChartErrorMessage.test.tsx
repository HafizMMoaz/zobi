import { render, screen } from 'spec/helpers/testing-library';
import '@testing-library/jest-dom';
import { ChartSource } from 'src/types/ChartSource';
import { useChartOwnerNames } from 'src/hooks/apiResources';
import { ResourceStatus } from 'src/hooks/apiResources/apiResources';
import { ErrorType } from '@zobi.dev/core';
import type { ErrorMessageComponentProps } from 'src/components/ErrorMessage/types';
import { getErrorMessageComponentRegistry } from 'src/components/ErrorMessage';
import { ChartErrorMessage } from './ChartErrorMessage';

// Mock the useChartOwnerNames hook
jest.mock('src/hooks/apiResources', () => ({
  useChartOwnerNames: jest.fn(),
}));

const mockUseChartOwnerNames = useChartOwnerNames as jest.MockedFunction<
  typeof useChartOwnerNames
>;

const ERROR_MESSAGE_COMPONENT = (props: ErrorMessageComponentProps) => (
  <>
    <div>Test error</div>
    <div>{props.subtitle}</div>
  </>
);

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ChartErrorMessage', () => {
  const defaultProps = {
    chartId: 1,
    subtitle: 'Test subtitle',
    source: 'test_source' as ChartSource,
  };

  test('renders the default error message when error is null', () => {
    mockUseChartOwnerNames.mockReturnValue({
      result: null,
      status: ResourceStatus.Loading,
      error: null,
    });
    render(<ChartErrorMessage {...defaultProps} />);

    expect(screen.getByText('Data error')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  test('renders the error message that is passed in from the error', () => {
    getErrorMessageComponentRegistry().registerValue(
      'VALID_KEY',
      ERROR_MESSAGE_COMPONENT,
    );
    render(
      <ChartErrorMessage
        {...defaultProps}
        error={{
          error_type: 'VALID_KEY' as unknown as ErrorType,
          message: 'Subtitle',
          level: 'error',
          extra: {},
        }}
      />,
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  test('chart error banner is not dismissible', () => {
    mockUseChartOwnerNames.mockReturnValue({
      result: null,
      status: ResourceStatus.Loading,
      error: null,
    });
    render(<ChartErrorMessage {...defaultProps} />);

    expect(
      screen.queryByRole('button', { name: /close/i }),
    ).not.toBeInTheDocument();
  });
});
