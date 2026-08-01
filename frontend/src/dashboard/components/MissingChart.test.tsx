import { render } from 'spec/helpers/testing-library';

import MissingChart from 'src/dashboard/components/MissingChart';

type MissingChartProps = {
  height: number;
};

const setup = (overrides?: MissingChartProps) => (
  <MissingChart height={100} {...overrides} />
);

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('MissingChart', () => {
  test('renders a .missing-chart-container', () => {
    const rendered = render(setup());

    const missingChartContainer = rendered.container.querySelector(
      '.missing-chart-container',
    );
    expect(missingChartContainer).toBeVisible();
  });

  test('renders a .missing-chart-body', () => {
    const rendered = render(setup());

    const missingChartBody = rendered.container.querySelector(
      '.missing-chart-body',
    );
    const bodyText =
      'There is no chart definition associated with this component, could it have been deleted?<br><br>Delete this container and save to remove this message.';

    expect(missingChartBody).toBeVisible();
    expect(missingChartBody?.innerHTML).toMatch(bodyText);
  });
});
