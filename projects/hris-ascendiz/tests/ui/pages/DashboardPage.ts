import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly heading: Locator;
  readonly sidebar: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('h1');
    this.sidebar = page.locator('nav, [class*="sidebar"], aside');
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async getHeadingText(): Promise<string | null> {
    return this.heading.textContent();
  }

  async navigateTo(menuLabel: string): Promise<void> {
    await this.sidebar.getByRole('link', { name: menuLabel }).click();
  }
}
