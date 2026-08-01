
import { Page } from '@playwright/test';
import { Input, Modal } from '../core';

/**
 * Save Dataset modal in SQL Lab.
 * Appears when clicking "Save dataset" after running a query.
 */
export class SaveDatasetModal extends Modal {
  constructor(page: Page) {
    super(page, '[data-test="Save or Overwrite Dataset-modal"] .ant-modal');
  }

  private get nameInput(): Input {
    return new Input(
      this.page,
      this.body.locator('input[placeholder="Dataset name"]'),
    );
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
  }
}
