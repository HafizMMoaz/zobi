
import { Page, Locator } from '@playwright/test';
import { Modal } from '../core/Modal';

/**
 * Confirm Dialog component for Ant Design Modal.confirm dialogs.
 * These are the "OK" / "Cancel" confirmation dialogs used throughout Zobi.
 * Uses getByRole with name to target specific confirm dialogs when multiple are open.
 */
export class ConfirmDialog extends Modal {
  private readonly specificLocator: Locator;

  constructor(page: Page, dialogName = 'Confirm save') {
    super(page);
    // Use getByRole with specific name to avoid strict mode violations
    // when multiple dialogs are open (e.g., Edit Dataset modal + Confirm save dialog)
    this.specificLocator = page.getByRole('dialog', { name: dialogName });
  }

  /**
   * Override element getter to use specific locator
   */
  override get element(): Locator {
    return this.specificLocator;
  }

  /**
   * Clicks the OK button to confirm.
   * @param options.timeout - If provided, silently returns if dialog doesn't appear
   *                          within timeout. If not provided, waits indefinitely (strict mode).
   */
  async clickOk(options?: { timeout?: number }): Promise<void> {
    try {
      await this.element.waitFor({
        state: 'visible',
        timeout: options?.timeout,
      });
      await this.clickFooterButton('OK');
      await this.waitForHidden();
    } catch (error) {
      // Only swallow TimeoutError when timeout was explicitly provided
      if (options?.timeout !== undefined) {
        if (error instanceof Error && error.name === 'TimeoutError') {
          return;
        }
      }
      throw error;
    }
  }

  /**
   * Clicks the Cancel button to dismiss
   */
  async clickCancel(): Promise<void> {
    await this.clickFooterButton('Cancel');
  }
}
