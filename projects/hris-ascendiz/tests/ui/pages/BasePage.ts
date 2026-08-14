import { Page, Locator } from '@playwright/test';

/**
 * Base class for all HRIS page objects.
 * Centralizes navigation and common role-based locator helpers.
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  heading(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name });
  }

  menuLink(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }
}
