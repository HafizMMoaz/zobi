
import { Locator, Page } from '@playwright/test';
import { Button } from './Button';

/**
 * Ant Design Popover component.
 */
export class Popover {
  readonly page: Page;
  private readonly locator: Locator;

  constructor(page: Page, locator?: Locator) {
    this.page = page;
    this.locator = locator ?? page.locator('.ant-popover-content');
  }

  get element(): Locator {
    return this.locator;
  }

  async waitForVisible(options?: { timeout?: number }): Promise<void> {
    await this.locator.waitFor({ state: 'visible', ...options });
  }

  async waitForHidden(options?: { timeout?: number }): Promise<void> {
    await this.locator.waitFor({ state: 'hidden', ...options });
  }

  getButton(name: string): Button {
    return new Button(
      this.page,
      this.locator.getByRole('button', { name, exact: true }),
    );
  }
}
