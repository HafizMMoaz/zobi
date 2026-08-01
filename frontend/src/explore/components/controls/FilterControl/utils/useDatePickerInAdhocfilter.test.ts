import { renderHook, cleanup } from '@testing-library/react';
import { TestDataset } from '@zobi-ui/chart-controls';
import { useDatePickerInAdhocFilter } from './useDatePickerInAdhocFilter';

// Add cleanup after each test
afterEach(async () => {
  cleanup();
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

test('should return undefined if column is not temporal', async () => {
  const { result, unmount } = renderHook(() =>
    useDatePickerInAdhocFilter({
      columnName: 'gender',
      datasource: TestDataset,
      onChange: jest.fn(),
    }),
  );
  expect(result.current).toBeUndefined();
  unmount();
});

test('should return JSX', async () => {
  const { result, unmount } = renderHook(() =>
    useDatePickerInAdhocFilter({
      columnName: 'ds',
      datasource: TestDataset,
      onChange: jest.fn(),
    }),
  );
  expect(result.current).not.toBeUndefined();
  unmount();
});
