
import { Locator, Page } from '@playwright/test';
import { Input } from './Input';
import { Button } from './Button';

export class Form {
  private readonly page: Page;

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
   * Gets the form element locator
   */
  get element(): Locator {
    return this.locator;
  }

  /**
   * Gets an input field within the form (properly scoped)
   * @param inputSelector - Selector for the input field
   */
  getInput(inputSelector: string): Input {
    const scopedLocator = this.locator.locator(inputSelector);
    return new Input(this.page, scopedLocator);
  }

  /**
   * Gets a button within the form (properly scoped)
   * @param buttonSelector - Selector for the button
   */
  getButton(buttonSelector: string): Button {
    const scopedLocator = this.locator.locator(buttonSelector);
    return new Button(this.page, scopedLocator);
  }

  /**
   * Checks if the form is visible
   */
  async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  /**
   * Submits the form (triggers submit event)
   */
  async submit(): Promise<void> {
    await this.locator.evaluate((form: HTMLElement) => {
      if (form instanceof HTMLFormElement) {
        form.submit();
      }
    });
  }

  /**
   * Waits for the form to be visible
   * @param options - Optional wait options
   */
  async waitForVisible(options?: { timeout?: number }): Promise<void> {
    await this.locator.waitFor({ state: 'visible', ...options });
  }

  /**
   * Gets all form data as key-value pairs
   * Useful for validation and debugging
   */
  async getFormData(): Promise<Record<string, string>> {
    return this.locator.evaluate((form: HTMLElement) => {
      if (form instanceof HTMLFormElement) {
        const formData = new FormData(form);
        const result: Record<string, string> = {};
        formData.forEach((value, key) => {
          result[key] = value.toString();
        });
        return result;
      }
      return {};
    });
  }
}
