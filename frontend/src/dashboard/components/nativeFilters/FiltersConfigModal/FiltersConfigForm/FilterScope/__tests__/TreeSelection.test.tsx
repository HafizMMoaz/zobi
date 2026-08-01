import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from 'spec/helpers/testing-library';
import type { FormInstance } from '@zobi.dev/core/components';
import { createMockModal, getTreeSwitcher } from './utils';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('FilterScope TreeSelection', () => {
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

  test('select tree values with 1 excluded', async () => {
    const { MockModalComponent } = createMockModal({ formRef });
    const modal = render(<MockModalComponent />);

    const scopingTab = await screen.findByRole('tab', { name: 'Scoping' });
    fireEvent.click(scopingTab);

    await waitFor(
      () => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
        expect(
          document.querySelector('.ant-tree-treenode'),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    fireEvent.click(getTreeSwitcher(2));

    const chartNode = await screen.findByText('CHART_ID2');
    fireEvent.click(chartNode);

    await waitFor(
      () => {
        expect(formRef.current).toBeTruthy();
        const scope = formRef.current?.getFieldValue([
          'filters',
          'DefaultFilterId',
          'scope',
        ]);
        expect(scope).toEqual({
          excluded: [20],
          rootPath: ['ROOT_ID'],
        });
      },
      { timeout: 3000 },
    );

    modal.unmount();
  });

  test('select 1 value only', async () => {
    const { MockModalComponent } = createMockModal({ formRef });
    const modal = render(<MockModalComponent />);

    const scopingTab = await screen.findByRole('tab', { name: 'Scoping' });
    fireEvent.click(scopingTab);

    await waitFor(
      () => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    fireEvent.click(getTreeSwitcher(2));

    const chartNode = await screen.findByText('CHART_ID2');
    fireEvent.click(chartNode);

    const tabNode = await screen.findByText('tab1');
    fireEvent.click(tabNode);

    await waitFor(
      () => {
        expect(formRef.current).toBeTruthy();
        const scope = formRef.current?.getFieldValue([
          'filters',
          'DefaultFilterId',
          'scope',
        ]);
        expect(scope).toEqual({
          excluded: [18, 20],
          rootPath: ['ROOT_ID'],
        });
      },
      { timeout: 3000 },
    );

    modal.unmount();
  });
});
