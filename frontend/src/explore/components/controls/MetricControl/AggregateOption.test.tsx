import { render, screen } from 'spec/helpers/testing-library';

import AggregateOption from 'src/explore/components/controls/MetricControl/AggregateOption';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('AggregateOption', () => {
  test('renders the aggregate', () => {
    render(<AggregateOption aggregate={{ aggregate_name: 'SUM' }} />);

    const aggregateOption = screen.getByText(/sum/i);
    expect(aggregateOption).toBeVisible();
  });
});
