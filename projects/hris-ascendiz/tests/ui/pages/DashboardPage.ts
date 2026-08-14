import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async expectDashboardVisible(): Promise<void> {
    await expect(this.menuLink('Attendance Management').first()).toBeVisible();
  }

  async navigateTo(menu: string | RegExp): Promise<void> {
    await this.menuLink(menu).first().click();
  }

  get attendanceMenu(): Locator {
    return this.menuLink(/Attendance Management/).first();
  }
}
