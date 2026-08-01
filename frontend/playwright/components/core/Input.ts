
import { Locator, Page } from '@playwright/test';

export class Input {
  private readonly locator: Locator;

  constructor(page: Page, selector: string);

  constructor(page: Page, locator: Locator);

  constructor(page: Page, selectorOrLocator: string | Locator) {
    if (typeof selectorOrLocator === 'string') {
      this.locator = page.locator(selectorOrLocator);
    } else {
      this.locator = selectorOrLocator;
    }
  }

  /**
   * Gets the input element locator
   */
  get element(): Locator {
    return this.locator;
  }

  /**
   * Fast fill - clears the input and sets the value directly
   * @param value - The value to fill
   * @param options - Optional fill options
   */
  async fill(
    value: string,
    options?: { timeout?: number; force?: boolean },
  ): Promise<void> {
    await this.element.fill(value, options);
  }

  /**
   * Types text character by character (simulates real typing)
   * @param text - The text to type
   * @param options - Optional typing options
   */
  async type(text: string, options?: { delay?: number }): Promise<void> {
    await this.element.type(text, options);
  }

  /**
   * Types text sequentially with more control over timing
   * @param text - The text to type
   * @param options - Optional sequential typing options
   */
  async pressSequentially(
    text: string,
    options?: { delay?: number },
  ): Promise<void> {
    await this.element.pressSequentially(text, options);
  }

  /**
   * Gets the current value of the input
   */
  async getValue(): Promise<string> {
    return this.element.inputValue();
  }

  /**
   * Clears the input field
   */
  async clear(): Promise<void> {
    await this.element.clear();
  }

  /**
   * Checks if the input is visible
   */
  async isVisible(): Promise<boolean> {
    return this.element.isVisible();
  }

  /**
   * Checks if the input is enabled
   */
  async isEnabled(): Promise<boolean> {
    return this.element.isEnabled();
  }

  /**
   * Focuses on the input field
   */
  async focus(): Promise<void> {
    await this.element.focus();
  }
}
