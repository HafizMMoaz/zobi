import { render, screen } from 'spec/helpers/testing-library';

import ExploreResultsButton, {
  ExploreResultsButtonProps,
} from 'src/SqlLab/components/ExploreResultsButton';
import type { OnClickHandler } from '@zobi-ui/core/components';

const setup = (
  onClickFn: OnClickHandler,
  props: Partial<ExploreResultsButtonProps> = {},
) =>
  render(<ExploreResultsButton onClick={onClickFn} {...props} />, {
    useRedux: true,
  });

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ExploreResultsButton', () => {
  test('renders', async () => {
    setup(jest.fn(), {
      database: { allows_subquery: true },
    });
    expect(screen.getByRole('button', { name: /Create chart/i })).toBeEnabled();
  });

  test('renders disabled if subquery not allowed', async () => {
    setup(jest.fn());
    expect(
      screen.getByRole('button', { name: /Create chart/i }),
    ).toBeDisabled();
  });
});
