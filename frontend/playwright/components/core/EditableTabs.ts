
import { Tabs } from './Tabs';

/**
 * EditableTabs component for Ant Design editable-card tabs.
 *
 * Mirrors the Zobi EditableTabs component (type="editable-card")
 * which adds add/remove tab functionality to the base Tabs component.
 *
 * The add button (.ant-tabs-nav-add) is only rendered when
 * type="editable-card". If the host component switches to type="card"
 * (e.g., SQL Lab empty state), use the host page object for that case.
 */
export class EditableTabs extends Tabs {
  /**
   * Clicks the add-tab button rendered by antd in editable-card mode.
   */
  async addTab(): Promise<void> {
    await this.element.getByRole('button', { name: 'Add tab' }).click();
  }

  /**
   * Clicks the remove button on the last tab.
   */
  async removeLastTab(): Promise<void> {
    await this.nav.locator('.ant-tabs-tab-remove').last().click();
  }
}
