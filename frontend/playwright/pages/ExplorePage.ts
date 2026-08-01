
import { Page, Locator } from '@playwright/test';
import { TIMEOUT } from '../utils/constants';

/**
 * Explore Page object
 */
export class ExplorePage {
  private readonly page: Page;

  private static readonly SELECTORS = {
    DATASOURCE_CONTROL: '[data-test="datasource-control"]',
    VIZ_SWITCHER: '[data-test="fast-viz-switcher"]',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for the Explore page to load.
   * Validates URL contains /explore/ and datasource control is visible.
   *
   * @param options - Optional wait options
   */
  async waitForPageLoad(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout ?? TIMEOUT.PAGE_LOAD;

    await this.page.waitForURL('**/explore/**', { timeout });

    await this.page.waitForSelector(ExplorePage.SELECTORS.DATASOURCE_CONTROL, {
      state: 'visible',
      timeout,
    });
  }

  /**
   * Gets the datasource control locator.
   * Returns a Locator that tests can use with expect() or to read text.
   *
   * @returns Locator for the datasource control
   *
   * @example
   * const name = await explorePage.getDatasourceControl().textContent();
   */
  getDatasourceControl(): Locator {
    return this.page.locator(ExplorePage.SELECTORS.DATASOURCE_CONTROL);
  }

  /**
   * Gets the currently selected dataset name from the datasource control
   */
  async getDatasetName(): Promise<string> {
    const text = await this.getDatasourceControl().textContent();
    return text?.trim() || '';
  }

  /**
   * Gets the visualization switcher locator.
   * Returns a Locator that tests can use with expect().toBeVisible(), etc.
   *
   * @returns Locator for the viz switcher
   *
   * @example
   * await expect(explorePage.getVizSwitcher()).toBeVisible();
   */
  getVizSwitcher(): Locator {
    return this.page.locator(ExplorePage.SELECTORS.VIZ_SWITCHER);
  }
}
