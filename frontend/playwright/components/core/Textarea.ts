
import { Locator, Page } from '@playwright/test';

/**
 * Playwright helper for interacting with HTML {@link HTMLTextAreaElement | `<textarea>`} elements.
 *
 * This component wraps a Playwright {@link Locator} and provides convenience methods for
 * filling, clearing, and reading the value of a textarea without having to work with
 * locators directly.
 *
 * Typical usage:
 * ```ts
 * const textarea = new Textarea(page, 'textarea[name="description"]');
 * await textarea.fill('Some multi-line text');
 * const value = await textarea.getValue();
 * ```
 *
 * You can also construct an instance from the `name` attribute:
 * ```ts
 * const textarea = Textarea.fromName(page, 'description');
 * await textarea.clear();
 * ```
 */
export class Textarea {
  readonly page: Page;
  private readonly locator: Locator;

  constructor(page: Page, selector: string);
  constructor(page: Page, locator: Locator);
  constructor(page: Page, selectorOrLocator: string | Locator) {
    this.page = page;
    if (typeof selectorOrLocator === 'string') {
      this.locator = page.locator(selectorOrLocator);
    } else {
      this.locator = selectorOrLocator;
    }
  }

  /**
   * Creates a Textarea from a name attribute
   * @param page - The Playwright page
   * @param name - The name attribute value
   */
  static fromName(page: Page, name: string): Textarea {
    const locator = page.locator(`textarea[name="${name}"]`);
    return new Textarea(page, locator);
  }

  /**
   * Gets the textarea element locator
   */
  get element(): Locator {
    return this.locator;
  }

  /**
   * Fills the textarea with text (clears existing content)
   * @param text - The text to fill
   */
  async fill(text: string): Promise<void> {
    await this.locator.fill(text);
  }

  /**
   * Clears the textarea content
   */
  async clear(): Promise<void> {
    await this.locator.clear();
  }

  /**
   * Gets the current value of the textarea
   */
  async getValue(): Promise<string> {
    return this.locator.inputValue();
  }

  /**
   * Checks if the textarea is visible
   */
  async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  /**
   * Checks if the textarea is enabled
   */
  async isEnabled(): Promise<boolean> {
    return this.locator.isEnabled();
  }
}
