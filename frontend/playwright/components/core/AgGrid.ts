
import { Locator, Page } from '@playwright/test';

const AG_GRID_SELECTORS = {
  ROOT: '[role="grid"]',
  HEADER_ROW: '.ag-header-row',
  HEADER_CELL: '.ag-header-cell',
  BODY_ROW: '.ag-row',
  CELL: '.ag-cell',
} as const;

/**
 * AG Grid component wrapper for Playwright.
 * Used by FilterableTable/GridTable in SQL Lab results and elsewhere.
 */
export class AgGrid {
  readonly page: Page;
  private readonly locator: Locator;

  constructor(page: Page, locator: Locator) {
    this.page = page;
    this.locator = locator;
  }

  get element(): Locator {
    return this.locator;
  }

  /**
   * Wait for the grid to render with data rows
   */
  async waitForRows(options?: { timeout?: number }): Promise<void> {
    await this.locator
      .locator(AG_GRID_SELECTORS.BODY_ROW)
      .first()
      .waitFor({ state: 'visible', ...options });
  }

  /**
   * Get header cell texts
   */
  async getHeaderTexts(): Promise<string[]> {
    return this.locator
      .locator(AG_GRID_SELECTORS.HEADER_CELL)
      .allTextContents();
  }

  /**
   * Get the number of visible data rows
   */
  async getRowCount(): Promise<number> {
    return this.locator.locator(AG_GRID_SELECTORS.BODY_ROW).count();
  }

  /**
   * Get cell text at a specific row and column index (0-based)
   */
  async getCellText(row: number, col: number): Promise<string> {
    const text = await this.locator
      .locator(AG_GRID_SELECTORS.BODY_ROW)
      .nth(row)
      .locator(AG_GRID_SELECTORS.CELL)
      .nth(col)
      .textContent();
    return text?.trim() ?? '';
  }
}
