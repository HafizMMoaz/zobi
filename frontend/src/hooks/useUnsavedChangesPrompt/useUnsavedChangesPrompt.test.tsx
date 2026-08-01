import { renderHook, act } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { useUnsavedChangesPrompt } from '.';

let history = createMemoryHistory({
  initialEntries: ['/dashboard'],
});

beforeEach(() => {
  history = createMemoryHistory({ initialEntries: ['/dashboard'] });
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Router history={history}>{children}</Router>
);

test('should not show modal initially', () => {
  const { result } = renderHook(
    () =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        onSave: jest.fn(),
      }),
    { wrapper },
  );

  expect(result.current.showModal).toBe(false);
});

test('should block navigation and show modal if there are unsaved changes', () => {
  const { result } = renderHook(
    () =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        onSave: jest.fn(),
      }),
    { wrapper },
  );

  act(() => {
    history.push('/another-page');
  });

  expect(result.current.showModal).toBe(true);
});

test('should trigger onSave and hide modal on handleSaveAndCloseModal', async () => {
  const onSave = jest.fn().mockResolvedValue(undefined);

  const { result } = renderHook(
    () =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        onSave,
      }),
    { wrapper },
  );

  await result.current.handleSaveAndCloseModal();

  expect(onSave).toHaveBeenCalled();
  expect(result.current.showModal).toBe(false);
});

test('should trigger manual save and not show modal again', async () => {
  const onSave = jest.fn().mockResolvedValue(undefined);

  const { result } = renderHook(
    () =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        onSave,
      }),
    { wrapper },
  );

  result.current.triggerManualSave();

  expect(onSave).toHaveBeenCalled();
  expect(result.current.showModal).toBe(false);
});

test('should close modal when handleConfirmNavigation is called', () => {
  const onSave = jest.fn();

  const { result } = renderHook(
    () =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        onSave,
      }),
    { wrapper },
  );

  // First, trigger navigation to show the modal
  act(() => {
    history.push('/another-page');
  });

  expect(result.current.showModal).toBe(true);

  // Then call handleConfirmNavigation to discard changes
  act(() => {
    result.current.handleConfirmNavigation();
  });

  expect(result.current.showModal).toBe(false);
});

test('should preserve pathname, search, and state when confirming navigation', () => {
  const onSave = jest.fn();
  const history = createMemoryHistory();
  const wrapper = ({ children }: any) => (
    <Router history={history}>{children}</Router>
  );

  const locationState = { fromDashboard: true, dashboardId: 123 };
  const pathname = '/another-page';
  const search = '?slice_id=42&foo=bar';

  const { result } = renderHook(
    () => useUnsavedChangesPrompt({ hasUnsavedChanges: true, onSave }),
    { wrapper },
  );

  const pushSpy = jest.spyOn(history, 'push');

  // Simulate a blocked navigation (the hook sets up history.block internally)
  act(() => {
    history.push({ pathname, search }, locationState);
  });

  // Modal should now be visible
  expect(result.current.showModal).toBe(true);

  // Confirm navigation
  act(() => {
    result.current.handleConfirmNavigation();
  });

  // Modal should close
  expect(result.current.showModal).toBe(false);

  // Verify correct call with pathname, search, and state preserved
  expect(pushSpy).toHaveBeenCalledWith({ pathname, search }, locationState);

  pushSpy.mockRestore();
});
