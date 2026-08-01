
import { Page, Locator } from '@playwright/test';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

const SELECTORS = {
  CONTAINER: '[data-test="toast-container"][role="alert"]',
  CONTENT: '.toast__content',
  CLOSE_BUTTON: '[data-test="close-button"]',
} as const;

/**
 * Toast notification component
 * Handles success, danger, warning, and info toasts
 */
export class Toast {
  private page: Page;
  private container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator(SELECTORS.CONTAINER);
  }

  /**
   * Get the toast container locator
   */
  get(): Locator {
    return this.container;
  }

  /**
   * Get the toast message text
   */
  getMessage(): Locator {
    return this.container.locator(SELECTORS.CONTENT);
  }

  /**
   * Wait for a toast to appear
   */
  async waitForVisible(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
  }

  /**
   * Wait for toast to disappear
   */
  async waitForHidden(): Promise<void> {
    await this.container.waitFor({ state: 'hidden' });
  }

  /**
   * Get a success toast
   */
  getSuccess(): Locator {
    return this.page.locator(`${SELECTORS.CONTAINER}.toast--success`);
  }

  /**
   * Get a danger/error toast
   */
  getDanger(): Locator {
    return this.page.locator(`${SELECTORS.CONTAINER}.toast--danger`);
  }

  /**
   * Get a warning toast
   */
  getWarning(): Locator {
    return this.page.locator(`${SELECTORS.CONTAINER}.toast--warning`);
  }

  /**
   * Get an info toast
   */
  getInfo(): Locator {
    return this.page.locator(`${SELECTORS.CONTAINER}.toast--info`);
  }

  /**
   * Close the toast by clicking the close button
   */
  async close(): Promise<void> {
    await this.container.locator(SELECTORS.CLOSE_BUTTON).click();
  }
}
