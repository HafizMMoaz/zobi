import {
  FeatureFlag,
  initFeatureFlags,
  isFeatureEnabled,
} from '@zobi.dev/core';
import * as uiCore from '@zobi.dev/extension-api';

test('initializes feature flags', () => {
  Object.defineProperty(window, 'featureFlags', {
    value: undefined,
  });
  initFeatureFlags();
  expect(window.featureFlags).toEqual({});
});

test('initializes feature flags with predefined values', () => {
  Object.defineProperty(window, 'featureFlags', {
    value: undefined,
  });
  const featureFlags = {
    DRILL_BY: false,
  };
  initFeatureFlags(featureFlags);
  expect(window.featureFlags).toEqual(featureFlags);
});

test('does nothing if feature flags are already initialized', () => {
  const featureFlags = { DRILL_BY: false };
  Object.defineProperty(window, 'featureFlags', {
    value: featureFlags,
  });
  initFeatureFlags({ DRILL_BY: true });
  expect(window.featureFlags).toEqual(featureFlags);
});

test('returns false and raises console error if feature flags have not been initialized', () => {
  const logging = jest.spyOn(uiCore.utils.logging, 'error');
  Object.defineProperty(window, 'featureFlags', {
    value: undefined,
  });
  expect(isFeatureEnabled(FeatureFlag.DrillBy)).toEqual(false);
  expect(uiCore.utils.logging.error).toHaveBeenCalled();
  expect(logging).toHaveBeenCalledWith('Failed to query feature flag DRILL_BY');
});

test('returns false for unset feature flag', () => {
  Object.defineProperty(window, 'featureFlags', {
    value: {},
  });
  expect(isFeatureEnabled(FeatureFlag.DrillBy)).toEqual(false);
});

test('returns true for set feature flag', () => {
  Object.defineProperty(window, 'featureFlags', {
    value: {
      DRILL_BY: true,
    },
  });
  expect(isFeatureEnabled(FeatureFlag.DrillBy)).toEqual(true);
});

test('GranularExportControls feature flag has expected string value', () => {
  expect(FeatureFlag.GranularExportControls).toBe('GRANULAR_EXPORT_CONTROLS');
});

test('returns true for set GranularExportControls feature flag', () => {
  Object.defineProperty(window, 'featureFlags', {
    value: {
      GRANULAR_EXPORT_CONTROLS: true,
    },
  });
  expect(isFeatureEnabled(FeatureFlag.GranularExportControls)).toEqual(true);
});
