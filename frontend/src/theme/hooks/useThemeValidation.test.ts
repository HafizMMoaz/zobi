import { renderHook } from '@testing-library/react';
import { useThemeValidation } from './useThemeValidation';

test('useThemeValidation validates valid theme with standard tokens', () => {
  const validTheme = JSON.stringify({
    token: {
      colorPrimary: '#1890ff',
      fontSize: 14,
    },
  });

  const { result } = renderHook(() => useThemeValidation(validTheme));

  expect(result.current.hasErrors).toBe(false);
  expect(result.current.hasWarnings).toBe(false);
  expect(result.current.annotations).toHaveLength(0);
});

test('useThemeValidation shows warnings for unknown tokens', () => {
  const themeWithUnknownToken = JSON.stringify({
    token: {
      colorPrimary: '#1890ff',
      unknownToken: 'value',
    },
  });

  const { result } = renderHook(() =>
    useThemeValidation(themeWithUnknownToken),
  );

  expect(result.current.hasErrors).toBe(false);
  expect(result.current.hasWarnings).toBe(true);
  expect(result.current.annotations.length).toBeGreaterThan(0);
  expect(result.current.annotations[0].type).toBe('warning');
});

test('useThemeValidation shows error for empty theme', () => {
  const emptyTheme = JSON.stringify({});

  const { result } = renderHook(() => useThemeValidation(emptyTheme));

  expect(result.current.hasErrors).toBe(true);
  expect(result.current.annotations.length).toBeGreaterThan(0);
  expect(result.current.annotations[0].type).toBe('error');
  expect(result.current.annotations[0].text).toContain('cannot be empty');
});

test('useThemeValidation shows error for invalid JSON syntax', () => {
  const invalidJson = '{invalid json}';

  const { result } = renderHook(() => useThemeValidation(invalidJson));

  expect(result.current.hasErrors).toBe(true);
  expect(result.current.annotations.length).toBeGreaterThan(0);
  expect(result.current.annotations[0].type).toBe('error');
});

test('useThemeValidation skips validation for empty string', () => {
  const { result } = renderHook(() => useThemeValidation(''));

  expect(result.current.hasErrors).toBe(false);
  expect(result.current.hasWarnings).toBe(false);
  expect(result.current.annotations).toHaveLength(0);
});

test('useThemeValidation validates Zobi custom tokens', () => {
  const themeWithCustomToken = JSON.stringify({
    token: {
      brandLogoUrl: '/static/logo.png',
      brandSpinnerSvg: '<svg></svg>',
    },
  });

  const { result } = renderHook(() => useThemeValidation(themeWithCustomToken));

  expect(result.current.hasErrors).toBe(false);
  expect(result.current.hasWarnings).toBe(false);
  expect(result.current.annotations).toHaveLength(0);
});

test('useThemeValidation allows theme with only algorithm', () => {
  const themeWithAlgorithm = JSON.stringify({
    algorithm: 'dark',
  });

  const { result } = renderHook(() => useThemeValidation(themeWithAlgorithm));

  expect(result.current.hasErrors).toBe(false);
  expect(result.current.annotations).toHaveLength(0);
});

test('useThemeValidation shows warning for null token value', () => {
  const themeWithNullValue = JSON.stringify({
    token: {
      colorPrimary: null,
    },
  });

  const { result } = renderHook(() => useThemeValidation(themeWithNullValue));

  expect(result.current.hasErrors).toBe(false);
  expect(result.current.hasWarnings).toBe(true);
  expect(result.current.annotations[0].type).toBe('warning');
  expect(result.current.annotations[0].text).toContain('null/undefined');
});

test('useThemeValidation respects enabled option', () => {
  const invalidJson = '{invalid}';

  const { result } = renderHook(() =>
    useThemeValidation(invalidJson, { enabled: false }),
  );

  expect(result.current.annotations).toHaveLength(0);
});
