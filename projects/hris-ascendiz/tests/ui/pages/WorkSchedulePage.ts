import { Locator, Page } from '@playwright/test';
import { expect } from '@shared/fixtures/ui.fixture';
import { BasePage } from './BasePage';

/**
 * Page object untuk modul Shift Management (Work Schedule).
 */
export class WorkSchedulePage extends BasePage {
  // --- List ---
  private readonly listSearch: Locator = this.page.getByPlaceholder('Search by name');
  private readonly rows: Locator = this.page.locator('table tbody tr');

  // --- Create / Edit form ---
  private readonly nameInput: Locator = this.page.getByRole('textbox', { name: 'Name' });
  private readonly multiselects: Locator = this.page.locator('.multiselect-wrapper');
  private readonly statusSelect: Locator = this.page.locator('#schedule_status');
  private readonly createButton: Locator = this.page.getByRole('button', { name: 'Create', exact: true });
  private readonly saveButton: Locator = this.page.getByRole('button', { name: 'Save', exact: true });
  private readonly successToast: Locator = this.page.getByText('Your data has been successfully saved.');

  constructor(page: Page) {
    super(page);
  }

  // ===================== List =====================

  async gotoList(): Promise<void> {
    await this.page.goto('/work-schedules');
    await expect(this.heading('Work Schedule List')).toBeVisible();
  }

  async searchByName(name: string): Promise<void> {
    await this.listSearch.fill(name);
    await this.listSearch.press('Enter');
    await this.page.waitForTimeout(1500);
  }

  rowByName(name: string): Locator {
    return this.rows.filter({ hasText: name }).first();
  }

  async expectRowVisible(name: string): Promise<void> {
    await expect(this.rowByName(name)).toBeVisible({ timeout: 10000 });
  }

  async expectRowHidden(name: string): Promise<void> {
    await expect(this.rowByName(name)).toHaveCount(0, { timeout: 10000 });
  }

  async expectRowContainsText(name: string, text: string | RegExp): Promise<void> {
    await expect(this.rowByName(name)).toContainText(text);
  }

  async expectColumns(headers: string[]): Promise<void> {
    for (const header of headers) {
      await expect(this.page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    }
  }

  // ===================== Create / Edit =====================

  async openCreate(): Promise<void> {
    await this.page.goto('/work-schedules/create');
    await expect(this.heading('Add Work Schedule')).toBeVisible();
  }

  async openEdit(name: string): Promise<void> {
    await this.rowByName(name).locator('a[href*="/edit"]').click();
    await expect(this.heading('Edit Work Schedule')).toBeVisible();
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async selectCompany(text: string): Promise<void> {
    await this.pickMultiselect(0, text);
  }

  async selectBusinessUnit(text: string): Promise<void> {
    await this.pickMultiselect(1, text);
  }

  async setAllTimes(data: { start: string; end: string; breakStart: string; breakEnd: string }): Promise<void> {
    const pairs: [string, string][] = [
      ['09:00', data.start],
      ['17:00', data.end],
      ['12:00', data.breakStart],
      ['13:00', data.breakEnd],
    ];
    for (const [placeholder, value] of pairs) {
      // Hanya input yang enabled (hari yang dicentang / bagian "All")
      const inputs = this.page.locator(`input[placeholder="${placeholder}"]:not([disabled])`);
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        await inputs.nth(i).fill(value);
      }
    }
  }

  async setEffectiveDateToday(): Promise<void> {
    await this.page.getByPlaceholder('Select Effective Date').click();
    await this.page.locator('.flatpickr-calendar.open .flatpickr-day.today').click();
  }

  async setStatus(status: string): Promise<void> {
    await this.statusSelect.selectOption({ label: status });
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click({ force: true });
  }

  async clickCreateExpectError(): Promise<void> {
    await this.createButton.click({ force: true });
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click({ force: true });
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: 10000 });
  }

  async expectFieldError(message: string | RegExp): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  private async pickMultiselect(index: number, text: string): Promise<void> {
    const wrapper = this.multiselects.nth(index);
    const search = wrapper.locator('input.multiselect-tags-search');
    await search.click({ force: true });
    await search.pressSequentially(text, { delay: 40 });
    await this.page.waitForTimeout(1200);
    await wrapper.locator('li[role="option"]').first().click({ force: true });
    await this.page.keyboard.press('Escape');
  }
}
