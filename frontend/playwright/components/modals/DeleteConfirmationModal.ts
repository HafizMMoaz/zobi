
import { Modal, Input } from '../core';

/**
 * Delete confirmation modal that requires typing "DELETE" to confirm.
 * Used throughout Zobi for destructive delete operations.
 *
 * Provides primitives for tests to compose deletion flows.
 */
export class DeleteConfirmationModal extends Modal {
  private static readonly SELECTORS = {
    CONFIRMATION_INPUT: 'input[type="text"]',
  };

  /**
   * Gets the confirmation input component
   */
  private get confirmationInput(): Input {
    return new Input(
      this.page,
      this.body.locator(DeleteConfirmationModal.SELECTORS.CONFIRMATION_INPUT),
    );
  }

  /**
   * Fills the confirmation input with the specified text.
   *
   * @param confirmationText - The text to type
   * @param options - Optional fill options (timeout, force)
   *
   * @example
   * const deleteModal = new DeleteConfirmationModal(page);
   * await deleteModal.waitForVisible();
   * await deleteModal.fillConfirmationInput('DELETE');
   * await deleteModal.clickDelete();
   * await deleteModal.waitForHidden();
   */
  async fillConfirmationInput(
    confirmationText: string,
    options?: { timeout?: number; force?: boolean },
  ): Promise<void> {
    await this.confirmationInput.fill(confirmationText, options);
  }

  /**
   * Clicks the Delete button in the footer
   *
   * @param options - Optional click options (timeout, force, delay)
   */
  async clickDelete(options?: {
    timeout?: number;
    force?: boolean;
    delay?: number;
  }): Promise<void> {
    await this.clickFooterButton('Delete', options);
  }
}
