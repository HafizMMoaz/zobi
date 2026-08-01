
import { Modal, Input } from '../core';

/**
 * Duplicate dataset modal that requires entering a new dataset name.
 * Used for duplicating virtual datasets with custom SQL.
 */
export class DuplicateDatasetModal extends Modal {
  private static readonly SELECTORS = {
    NAME_INPUT: '[data-test="duplicate-modal-input"]',
  };

  /**
   * Gets the new dataset name input component
   */
  private get nameInput(): Input {
    return new Input(
      this.page,
      this.body.locator(DuplicateDatasetModal.SELECTORS.NAME_INPUT),
    );
  }

  /**
   * Fills the new dataset name input
   *
   * @param datasetName - The new name for the duplicated dataset
   * @param options - Optional fill options (timeout, force)
   *
   * @example
   * const duplicateModal = new DuplicateDatasetModal(page);
   * await duplicateModal.waitForVisible();
   * await duplicateModal.fillDatasetName('my_dataset_copy');
   * await duplicateModal.clickDuplicate();
   * await duplicateModal.waitForHidden();
   */
  async fillDatasetName(
    datasetName: string,
    options?: { timeout?: number; force?: boolean },
  ): Promise<void> {
    const input = this.nameInput.element;
    // Clear existing text then fill (fill() clears first, but explicit clear is more reliable)
    await input.clear();
    await input.fill(datasetName, options);
  }

  /**
   * Clicks the Duplicate button in the footer
   *
   * @param options - Optional click options (timeout, force, delay)
   */
  async clickDuplicate(options?: {
    timeout?: number;
    force?: boolean;
    delay?: number;
  }): Promise<void> {
    await this.clickFooterButton('Duplicate', options);
  }
}
