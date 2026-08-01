
import { Page } from '@playwright/test';
import { Input, Modal } from '../core';

/**
 * Save Query modal in SQL Lab.
 * Appears when clicking the Save button in the SQL editor toolbar.
 */
export class SaveQueryModal extends Modal {
  constructor(page: Page) {
    super(page, '.save-query-modal');
  }

  private get nameInput(): Input {
    return new Input(
      this.page,
      this.body.locator('input[type="text"]').first(),
    );
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
  }
}
