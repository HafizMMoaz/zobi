import {
  isValidTokenName,
  isZobiCustomToken,
  getAllValidTokenNames,
} from './antdTokenNames';

test('isValidTokenName recognizes standard Ant Design tokens', () => {
  expect(isValidTokenName('colorPrimary')).toBe(true);
  expect(isValidTokenName('fontSize')).toBe(true);
  expect(isValidTokenName('padding')).toBe(true);
  expect(isValidTokenName('borderRadius')).toBe(true);
});

test('isValidTokenName recognizes Zobi custom tokens', () => {
  expect(isValidTokenName('brandLogoUrl')).toBe(true);
  expect(isValidTokenName('brandSpinnerSvg')).toBe(true);
  expect(isValidTokenName('fontSizeXS')).toBe(true);
  expect(isValidTokenName('echartsOptionsOverrides')).toBe(true);
});

test('isValidTokenName rejects unknown tokens', () => {
  expect(isValidTokenName('fooBarBaz')).toBe(false);
  expect(isValidTokenName('colrPrimary')).toBe(false);
  expect(isValidTokenName('invalidToken')).toBe(false);
});

test('isValidTokenName handles edge cases', () => {
  expect(isValidTokenName('')).toBe(false);
  expect(isValidTokenName('  ')).toBe(false);
});

test('isZobiCustomToken identifies Zobi-specific tokens', () => {
  expect(isZobiCustomToken('brandLogoUrl')).toBe(true);
  expect(isZobiCustomToken('brandSpinnerSvg')).toBe(true);
  expect(isZobiCustomToken('fontSizeXS')).toBe(true);
  expect(isZobiCustomToken('fontUrls')).toBe(true);
});

test('isZobiCustomToken returns false for Ant Design tokens', () => {
  expect(isZobiCustomToken('colorPrimary')).toBe(false);
  expect(isZobiCustomToken('fontSize')).toBe(false);
});

test('isZobiCustomToken returns false for unknown tokens', () => {
  expect(isZobiCustomToken('fooBar')).toBe(false);
});

test('getAllValidTokenNames returns categorized token names', () => {
  const result = getAllValidTokenNames();

  expect(result).toHaveProperty('antdTokens');
  expect(result).toHaveProperty('zobiTokens');
  expect(result).toHaveProperty('total');
});

test('getAllValidTokenNames has reasonable token counts', () => {
  const result = getAllValidTokenNames();

  // Ant Design tokens should exist (avoid brittle exact count that breaks on upgrades)
  expect(result.antdTokens.length).toBeGreaterThan(0);
  expect(result.antdTokens).toContain('colorPrimary');
  expect(result.antdTokens).toContain('fontSize');
  expect(result.antdTokens).toContain('borderRadius');

  // Zobi custom tokens should exist
  expect(result.zobiTokens.length).toBeGreaterThan(0);
  expect(result.zobiTokens).toContain('brandLogoUrl');
  expect(result.zobiTokens).toContain('fontUrls');

  // Total should be sum of both
  expect(result.total).toBe(
    result.antdTokens.length + result.zobiTokens.length,
  );
});

test('getAllValidTokenNames includes known Zobi tokens', () => {
  const result = getAllValidTokenNames();

  expect(result.zobiTokens).toContain('brandLogoUrl');
  expect(result.zobiTokens).toContain('brandSpinnerSvg');
  expect(result.zobiTokens).toContain('fontSizeXS');
});

test('getAllValidTokenNames includes known Ant Design tokens', () => {
  const result = getAllValidTokenNames();

  expect(result.antdTokens).toContain('colorPrimary');
  expect(result.antdTokens).toContain('fontSize');
  expect(result.antdTokens).toContain('padding');
});

test('label variant tokens are recognized as valid Zobi custom tokens', () => {
  const labelTokens = [
    // Published/Draft
    'labelPublishedColor',
    'labelPublishedBg',
    'labelPublishedBorderColor',
    'labelPublishedIconColor',
    'labelDraftColor',
    'labelDraftBg',
    'labelDraftBorderColor',
    'labelDraftIconColor',
    // Dataset type
    'labelDatasetPhysicalColor',
    'labelDatasetPhysicalBg',
    'labelDatasetPhysicalBorderColor',
    'labelDatasetPhysicalIconColor',
    'labelDatasetVirtualColor',
    'labelDatasetVirtualBg',
    'labelDatasetVirtualBorderColor',
    'labelDatasetVirtualIconColor',
  ];

  labelTokens.forEach(token => {
    expect(isValidTokenName(token)).toBe(true);
    expect(isZobiCustomToken(token)).toBe(true);
  });
});
