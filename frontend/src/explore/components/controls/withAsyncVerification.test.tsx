import { render } from 'spec/helpers/testing-library';
import withAsyncVerification, {
  ControlPropsWithExtras,
  WithAsyncVerificationOptions,
} from 'src/explore/components/controls/withAsyncVerification';
import { ExtraControlProps } from '@zobi.dev/chart-controls';
import MetricsControl from 'src/explore/components/controls/MetricControl/MetricsControl';

const VALID_METRIC = {
  metric_name: 'sum__value',
  expression: 'SUM(energy_usage.value)',
};

const mockSetControlValue = jest.fn();

const defaultProps = {
  name: 'metrics',
  label: 'Metrics',
  value: undefined,
  multi: true,
  needAsyncVerification: true,
  actions: { setControlValue: mockSetControlValue },
  onChange: (p0: string[]) => {
    console.log('onChange called with:', p0);
  },
  columns: [
    { type: 'VARCHAR(255)', column_name: 'source' },
    { type: 'VARCHAR(255)', column_name: 'target' },
    { type: 'DOUBLE', column_name: 'value' },
  ],
  savedMetrics: [
    VALID_METRIC,
    { metric_name: 'avg__value', expression: 'AVG(energy_usage.value)' },
  ],
  datasourceType: 'sqla',
};

function verify(sourceProp: string) {
  const mock = jest.fn();
  mock.mockImplementation(async (props: ControlPropsWithExtras) => ({
    [sourceProp]: props.validMetrics || [VALID_METRIC],
  }));
  return mock;
}

async function setup({
  extraProps,
  baseControl = MetricsControl as WithAsyncVerificationOptions['baseControl'],
  onChange,
}: Partial<WithAsyncVerificationOptions> & {
  extraProps?: ExtraControlProps;
} = {}) {
  const props = {
    ...defaultProps,
    ...extraProps,
  };
  const verifier = verify('savedMetrics');
  const VerifiedControl = withAsyncVerification({
    baseControl,
    verify: verifier,
    onChange,
  });
  const utils = render(<VerifiedControl {...props} />);
  return { props, ...utils, verifier, VerifiedControl };
}

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('VerifiedMetricsControl', () => {
  test('should call verify correctly', async () => {
    expect.assertions(3);
    const { verifier, props, rerender, VerifiedControl } = await setup();

    expect(verifier).toHaveBeenCalledTimes(1);
    expect(verifier).toHaveBeenCalledWith(
      expect.objectContaining({ savedMetrics: props.savedMetrics }),
    );

    // should call verifier with new props when props are updated
    rerender(<VerifiedControl {...props} validMetric={['abc']} />);

    expect(verifier).toHaveBeenCalledWith(
      expect.objectContaining({ validMetric: ['abc'] }),
    );
  });

  test('should trigger onChange event', async () => {
    expect.assertions(2);
    const mockOnChange = jest.fn();
    const { verifier, props } = await setup({
      baseControl: 'MetricsControl',
      onChange: mockOnChange,
      extraProps: {
        onChange: (value: any) => {
          // Simulate the MetricsControl onChange
          mockOnChange(value, props);
        },
      },
    });

    // Wait for the initial verification to complete
    await verifier;

    // Call the onChange from props
    props.onChange(['sum__value']);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(['sum__value'], props);
  });
});
