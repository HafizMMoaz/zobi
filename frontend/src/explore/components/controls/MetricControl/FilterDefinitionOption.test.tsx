import { render, screen, cleanup } from 'spec/helpers/testing-library';
import FilterDefinitionOption from 'src/explore/components/controls/MetricControl/FilterDefinitionOption';
import { AGGREGATES } from 'src/explore/constants';
import AdhocMetric, {
  EXPRESSION_TYPES,
} from 'src/explore/components/controls/MetricControl/AdhocMetric';

// Add cleanup after each test
afterEach(async () => {
  cleanup();
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

const sumValueAdhocMetric = new AdhocMetric({
  expressionType: EXPRESSION_TYPES.SIMPLE,
  column: { type: 'VARCHAR(255)', column_name: 'source' },
  aggregate: AGGREGATES.SUM,
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('FilterDefinitionOption', () => {
  test('renders a StyledColumnOption given a column', async () => {
    render(<FilterDefinitionOption option={{ column_name: 'a_column' }} />);
    await expect(screen.getByText('a_column')).toBeVisible();
  });

  test('renders a StyledColumnOption given an adhoc metric', async () => {
    render(
      <FilterDefinitionOption
        option={sumValueAdhocMetric as unknown as { label: string }}
      />,
    );
    await expect(screen.getByText('SUM(source)')).toBeVisible();
  });

  test('renders the metric name given a saved metric', async () => {
    render(
      <FilterDefinitionOption
        option={{ saved_metric_name: 'my_custom_metric' }}
      />,
    );
    await expect(screen.getByText('my_custom_metric')).toBeVisible();
  });
});
