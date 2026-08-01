
import { Locator, Page } from '@playwright/test';

/**
 * Core Checkbox component used in Playwright tests to interact with checkbox
 * elements in the Zobi UI.
 *
 * This class wraps a Playwright {@link Locator} pointing to a checkbox input
 * and provides convenience methods for common interactions such as checking,
 * unchecking, toggling, and asserting checkbox state and visibility.
 *
 * @example
 * const checkbox = new Checkbox(page, page.locator('input[type="checkbox"]'));
 * await checkbox.check();
 * await expect(await checkbox.isChecked()).toBe(true);
 *
 * @param page - The Playwright {@link Page} instance associated with the test.
 * @param locator - The Playwright {@link Locator} targeting the checkbox element.
 */
export class Checkbox {
  readonly page: Page;
  private readonly locator: Locator;

  constructor(page: Page, locator: Locator) {
    this.page = page;
    this.locator = locator;
  }

  /**
   * Gets the checkbox element locator
   */
  get element(): Locator {
    return this.locator;
  }

  /**
   * Checks the checkbox (ensures it's checked)
   */
  async check(): Promise<void> {
    await this.locator.check();
  }

  /**
   * Unchecks the checkbox (ensures it's unchecked)
   */
  async uncheck(): Promise<void> {
    await this.locator.uncheck();
  }

  /**
   * Toggles the checkbox state
   */
  async toggle(): Promise<void> {
    await this.locator.click();
  }

  /**
   * Checks if the checkbox is checked
   */
  async isChecked(): Promise<boolean> {
    return this.locator.isChecked();
  }

  /**
   * Checks if the checkbox is visible
   */
  async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  /**
   * Checks if the checkbox is enabled
   */
  async isEnabled(): Promise<boolean> {
    return this.locator.isEnabled();
  }
}
