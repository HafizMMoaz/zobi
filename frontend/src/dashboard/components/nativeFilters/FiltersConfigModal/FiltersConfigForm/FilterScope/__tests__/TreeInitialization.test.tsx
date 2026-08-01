import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from 'spec/helpers/testing-library';
import type { FormInstance } from '@zobi.dev/core/components';
import { createMockModal } from './utils';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('FilterScope TreeInitialization', () => {
  let formRef: { current: FormInstance | null };

  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
    formRef = { current: null };
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('correct init tree with values', async () => {
    const { MockModalComponent } = createMockModal({
      scope: {
        rootPath: ['TAB_ID'],
        excluded: [],
      },
      formRef,
    });

    const modal = render(<MockModalComponent />);

    const scopingTab = await screen.findByRole('tab', { name: 'Scoping' });
    fireEvent.click(scopingTab);

    jest.runAllTimers();

    await waitFor(
      () => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    jest.runAllTimers();

    await waitFor(
      () => {
        const checkedNodes = document.querySelectorAll(
          '.ant-tree-checkbox-checked',
        );
        expect(checkedNodes.length).toBe(1);
      },
      { timeout: 10000 },
    );

    modal.unmount();
  }, 30000);
});
