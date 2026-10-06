import { Locator, Page } from '@playwright/test';
import { expect } from '@shared/fixtures/ui.fixture';
import { BasePage } from './BasePage';

/**
 * Page object untuk modul Shift Management (Shift Request History).
 */
export class AllShiftRequestHistoryPage extends BasePage {
  private readonly dateInput: Locator = this.page.getByPlaceholder('Select date');
  private readonly searchButton: Locator = this.page.getByRole('button', { name: 'Search', exact: true });
  private readonly rows: Locator = this.page.locator('table tbody tr');
  private readonly yearInput: Locator = this.page.locator('.flatpickr-calendar.open input[aria-label="Year"]');
  private readonly days: Locator = this.page.locator('.flatpickr-calendar.open .flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)');
  private readonly deleteConfirmButton: Locator = this.page.getByRole('button', { name: 'Yes, Delete It!' });
  private readonly deleteToast: Locator = this.page.getByText('Your data has been successfully deleted.');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto('/all-shift-request-history');
    await expect(this.heading('Shift Request History')).toBeVisible();
  }

  async search(): Promise<void> {
    await this.searchButton.click();
    await this.page.waitForTimeout(2000);
  }

  /** Set date range ke bulan sebelumnya, durasi 1 bulan penuh (tanggal 1 s/d akhir bulan). */
  async usePreviousMonthRange(): Promise<void> {
    await this.dateInput.click();
    await this.page.waitForTimeout(800);
    await this.page.locator('.flatpickr-calendar.open .flatpickr-prev-month').first().click();
    await this.page.waitForTimeout(600);
    await this.days.first().click();
    await this.days.last().click();
    await this.page.waitForTimeout(400);
  }

  async useDateRangeYear(year: string): Promise<void> {
    await this.dateInput.click();
    await this.yearInput.first().fill(year);
    await this.yearInput.first().press('Enter');
    await this.page.waitForTimeout(800);
    await this.days.nth(0).click();
    await this.days.nth(5).click();
    await this.page.waitForTimeout(400);
  }

  async expectColumns(headers: string[]): Promise<void> {
    for (const header of headers) {
      await expect(this.page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    }
  }

  async expectHasRows(): Promise<void> {
    await expect(this.rows.first()).toBeVisible({ timeout: 10000 });
  }

  async expectNoRows(): Promise<void> {
    await expect(this.rows).toHaveCount(0, { timeout: 10000 });
    await expect(this.page.getByText('No Result Found')).toBeVisible();
  }

  rowById(id: string): Locator {
    return this.rows.filter({ hasText: id }).first();
  }

  /** Hapus row pertama, kembalikan id-nya untuk verifikasi. */
  async deleteFirstRow(): Promise<string> {
    const row = this.rows.first();
    const id = (await row.locator('td').first().innerText()).trim();
    await row.locator('a[href="#!"]').last().click({ force: true });
    await expect(this.page.getByText('Are you certain you want to delete this record?')).toBeVisible();
    await this.deleteConfirmButton.click();
    await expect(this.deleteToast).toBeVisible({ timeout: 10000 });
    return id;
  }

  async expectRowHidden(id: string): Promise<void> {
    await expect(this.rowById(id)).toHaveCount(0, { timeout: 10000 });
  }
}
