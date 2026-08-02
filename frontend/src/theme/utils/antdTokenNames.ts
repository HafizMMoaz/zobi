import { theme } from 'antd';

/**
 * Zobi-specific custom tokens that extend Ant Design's token system.
 * These keys are derived from the ZobiSpecificTokens interface to ensure consistency.
 */
const ZOBI_CUSTOM_TOKENS: Set<string> = new Set([
  // Font extensions (fontWeightStrong is an Ant Design token, not Zobi-specific)
  'fontSizeXS',
  'fontSizeXXL',
  'fontWeightNormal',
  'fontWeightLight',

  // Brand tokens
  'brandIconMaxWidth',
  'brandLogoAlt',
  'brandLogoUrl',
  'brandLogoMargin',
  'brandLogoHref',
  'brandLogoHeight',

  // Spinner tokens
  'brandSpinnerUrl',
  'brandSpinnerSvg',

  // ECharts tokens
  'echartsOptionsOverrides',
  'echartsOptionsOverridesByChartType',

  // Font loading
  'fontUrls',

  // Label variant tokens — Published/Draft (dashboard status)
  'labelPublishedColor',
  'labelPublishedBg',
  'labelPublishedBorderColor',
  'labelPublishedIconColor',
  'labelDraftColor',
  'labelDraftBg',
  'labelDraftBorderColor',
  'labelDraftIconColor',

  // Label variant tokens — Dataset type (Physical/Virtual)
  'labelDatasetPhysicalColor',
  'labelDatasetPhysicalBg',
  'labelDatasetPhysicalBorderColor',
  'labelDatasetPhysicalIconColor',
  'labelDatasetVirtualColor',
  'labelDatasetVirtualBg',
  'labelDatasetVirtualBorderColor',
  'labelDatasetVirtualIconColor',

  // Editor tokens
  'colorEditorSelection',

  // Secondary button tokens
  'buttonSecondaryColor',
  'buttonSecondaryBg',
  'buttonSecondaryBorderColor',
  'buttonSecondaryHoverColor',
  'buttonSecondaryHoverBg',
  'buttonSecondaryHoverBorderColor',
  'buttonSecondaryActiveColor',
  'buttonSecondaryActiveBg',
  'buttonSecondaryActiveBorderColor',
]);

/**
 * Lazy-loaded cache of valid token names.
 * Combines Ant Design tokens (extracted at runtime) + Zobi custom tokens.
 */
let validTokenNamesCache: Set<string> | undefined;

/**
 * Get all valid token names (Ant Design + Zobi custom).
 * Uses lazy loading and caching for performance.
 */
function getValidTokenNames(): Set<string> {
  if (validTokenNamesCache === undefined) {
    // Extract all token names from Ant Design's default theme
    const antdTokens = theme.getDesignToken();
    const antdTokenNames = Object.keys(antdTokens);

    // Combine with Zobi custom tokens
    validTokenNamesCache = new Set([...antdTokenNames, ...ZOBI_CUSTOM_TOKENS]);
  }
  return validTokenNamesCache;
}

/**
 * Check if a token name is valid (recognized by Ant Design OR Zobi).
 * @param tokenName - The token name to validate
 * @returns true if the token is recognized, false otherwise
 */
export function isValidTokenName(tokenName: string): boolean {
  return getValidTokenNames().has(tokenName);
}

/**
 * Check if a token is a Zobi custom token (not from Ant Design).
 * @param tokenName - The token name to check
 * @returns true if it's a Zobi-specific token
 */
export function isZobiCustomToken(tokenName: string): boolean {
  return ZOBI_CUSTOM_TOKENS.has(tokenName);
}

/**
 * Get all valid token names, categorized by source.
 * Useful for debugging and testing.
 */
export function getAllValidTokenNames(): {
  antdTokens: string[];
  zobiTokens: string[];
  total: number;
} {
  const allTokens = getValidTokenNames();
  const antdTokens = Array.from(allTokens).filter(t => !isZobiCustomToken(t));
  const zobiTokens: string[] = Array.from(ZOBI_CUSTOM_TOKENS);

  return {
    antdTokens,
    zobiTokens,
    total: allTokens.size,
  };
}
