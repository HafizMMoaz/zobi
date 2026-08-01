
import { Page } from '@playwright/test';
import { Modal } from '../core';

/**
 * Chart properties edit modal.
 * Opened by clicking the edit icon on a chart row in the chart list.
 * General section is expanded by default (defaultActiveKey="general").
 */
export class ChartPropertiesModal extends Modal {
  private static readonly SELECTORS = {
    NAME_INPUT: '[data-test="properties-modal-name-input"]',
  };

  constructor(page: Page) {
    super(page, '[data-test="properties-edit-modal"]');
  }

  /**
   * Fills the chart name input field
   * @param name - The new chart name
   */
  async fillName(name: string): Promise<void> {
    const input = this.body.locator(ChartPropertiesModal.SELECTORS.NAME_INPUT);
    await input.fill(name);
  }

  /**
   * Clicks the Save button in the modal footer
   */
  async clickSave(): Promise<void> {
    await this.clickFooterButton('Save');
  }
}
