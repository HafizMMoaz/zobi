import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import configureStore from 'redux-mock-store';
import { usePermissions } from './usePermissions';

const mockStore = configureStore([]);

const rolesWithAllPerms = {
  Admin: [
    ['can_csv', 'Zobi'],
    ['can_export_data', 'Zobi'],
    ['can_export_image', 'Zobi'],
    ['can_copy_clipboard', 'Zobi'],
    ['can_explore', 'Zobi'],
  ],
};

const rolesWithoutExportPerms = {
  Gamma: [
    ['can_explore', 'Zobi'],
    ['can_copy_clipboard', 'Zobi'],
  ],
};

const rolesWithLegacyCsvOnly = {
  CustomRole: [
    ['can_csv', 'Zobi'],
    ['can_explore', 'Zobi'],
  ],
};

function createWrapper(roles: Record<string, string[][]>) {
  const store = mockStore({ user: { roles } });
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
}

jest.mock('@zobi.dev/core', () => ({
  ...jest.requireActual('@zobi.dev/core'),
  isFeatureEnabled: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { isFeatureEnabled } = require('@zobi.dev/core');

test('returns canExportData true when user has can_export_data', () => {
  isFeatureEnabled.mockReturnValue(true);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithAllPerms),
  });
  expect(result.current.canExportData).toBe(true);
});

test('returns canExportImage true when user has can_export_image', () => {
  isFeatureEnabled.mockReturnValue(true);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithAllPerms),
  });
  expect(result.current.canExportImage).toBe(true);
});

test('returns canCopyClipboard true when user has can_copy_clipboard', () => {
  isFeatureEnabled.mockReturnValue(true);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithAllPerms),
  });
  expect(result.current.canCopyClipboard).toBe(true);
});

test('returns canExportData false when user lacks can_export_data', () => {
  isFeatureEnabled.mockReturnValue(true);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithoutExportPerms),
  });
  expect(result.current.canExportData).toBe(false);
});

test('returns canExportImage false when user lacks can_export_image', () => {
  isFeatureEnabled.mockReturnValue(true);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithoutExportPerms),
  });
  expect(result.current.canExportImage).toBe(false);
});

test('canDownload uses can_export_data when GRANULAR_EXPORT_CONTROLS enabled', () => {
  isFeatureEnabled.mockReturnValue(true);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithAllPerms),
  });
  expect(result.current.canDownload).toBe(true);
});

test('canDownload uses can_csv when GRANULAR_EXPORT_CONTROLS disabled', () => {
  isFeatureEnabled.mockReturnValue(false);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithLegacyCsvOnly),
  });
  expect(result.current.canDownload).toBe(true);
});

test('canDownload false when GRANULAR_EXPORT_CONTROLS enabled but no can_export_data', () => {
  isFeatureEnabled.mockReturnValue(true);
  const { result } = renderHook(() => usePermissions(), {
    wrapper: createWrapper(rolesWithoutExportPerms),
  });
  expect(result.current.canDownload).toBe(false);
});
