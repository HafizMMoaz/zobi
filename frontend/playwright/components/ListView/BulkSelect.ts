
import { Locator, Page } from '@playwright/test';
import { Button, Checkbox, Table } from '../core';

const BULK_SELECT_SELECTORS = {
  CONTROLS: '[data-test="bulk-select-controls"]',
  ACTION: '[data-test="bulk-select-action"]',
} as const;

/**
 * BulkSelect component for Zobi ListView bulk operations.
 * Provides a reusable interface for bulk selection and actions across list pages.
 *
 * @example
 * const bulkSelect = new BulkSelect(page, table);
 * await bulkSelect.enable();
 * await bulkSelect.selectRow('my-dataset');
 * await bulkSelect.selectRow('another-dataset');
 * await bulkSelect.clickAction('Delete');
 */
export class BulkSelect {
  private readonly page: Page;
  private readonly table: Table;

  constructor(page: Page, table: Table) {
    this.page = page;
    this.table = table;
  }

  /**
   * Gets the "Bulk select" toggle button
   */
  getToggleButton(): Button {
    return new Button(
      this.page,
      this.page.getByRole('button', { name: 'Bulk select' }),
    );
  }

  /**
   * Enables bulk selection mode by clicking the toggle button
   */
  async enable(): Promise<void> {
    await this.getToggleButton().click();
  }

  /**
   * Gets the checkbox for a row by name
   * @param rowName - The name/text identifying the row
   */
  getRowCheckbox(rowName: string): Checkbox {
    const row = this.table.getRow(rowName);
    return new Checkbox(this.page, row.getByRole('checkbox'));
  }

  /**
   * Selects a row's checkbox in bulk select mode
   * @param rowName - The name/text identifying the row to select
   */
  async selectRow(rowName: string): Promise<void> {
    await this.getRowCheckbox(rowName).check();
  }

  /**
   * Deselects a row's checkbox in bulk select mode
   * @param rowName - The name/text identifying the row to deselect
   */
  async deselectRow(rowName: string): Promise<void> {
    await this.getRowCheckbox(rowName).uncheck();
  }

  /**
   * Gets the bulk select controls container locator (for assertions)
   */
  getControls(): Locator {
    return this.page.locator(BULK_SELECT_SELECTORS.CONTROLS);
  }

  /**
   * Gets a bulk action button by name
   * @param actionName - The name of the bulk action (e.g., "Export", "Delete")
   */
  getActionButton(actionName: string): Button {
    const controls = this.getControls();
    return new Button(
      this.page,
      controls.locator(BULK_SELECT_SELECTORS.ACTION, { hasText: actionName }),
    );
  }

  /**
   * Clicks a bulk action button by name (e.g., "Export", "Delete")
   * @param actionName - The name of the bulk action to click
   */
  async clickAction(actionName: string): Promise<void> {
    await this.getActionButton(actionName).click();
  }
}
