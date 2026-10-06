import { Locator, Page } from '@playwright/test';
import { expect } from '@shared/fixtures/ui.fixture';
import { BasePage } from './BasePage';

/**
 * Page object untuk modul Shift Management (Shift Template).
 * Mencakup list, modal create/edit, dan verifikasi hasil.
 */
export class ShiftTemplatePage extends BasePage {
  // --- List ---
  private readonly addButton: Locator = this.page.getByRole('button', { name: 'Add Shift Template' });
  private readonly searchInput: Locator = this.page.getByPlaceholder('Search by name...');
  private readonly templateRows: Locator = this.page.locator('table tbody tr');

  // --- Create/Edit modal ---
  private readonly nameInput: Locator = this.page.getByRole('textbox', { name: 'Name', exact: true });
  private readonly multiselects: Locator = this.page.locator('.multiselect-wrapper');
  private readonly requiredClockInOutLabel: Locator = this.page.locator('label[for="required_clock_in_out"]');
  private readonly requiredBreakLabel: Locator = this.page.locator('label[for="required_break_start_end"]');
  private readonly startTimeInput: Locator = this.page.getByPlaceholder('09:00').first();
  private readonly endTimeInput: Locator = this.page.getByPlaceholder('17:00').first();
  private readonly breakStartTimeInput: Locator = this.page.getByPlaceholder('09:00').nth(1);
  private readonly breakEndTimeInput: Locator = this.page.getByPlaceholder('17:00').nth(1);
  private readonly isDefaultLabel: Locator = this.page.locator('label[for="is_default"]');

  private readonly statusSelect: Locator = this.page.locator('select').filter({ has: this.page.locator('option', { hasText: 'Inactive' }) });
  private readonly saveButton: Locator = this.page.getByRole('button', { name: 'Save', exact: true });

  private readonly createButton: Locator = this.page.getByRole('button', { name: 'Create', exact: true });
  private readonly cancelButton: Locator = this.page.getByRole('button', { name: 'Cancel', exact: true });
  private readonly savedSuccessToast: Locator = this.page.getByText('Your data has been successfully saved.');
  private readonly deleteConfirmText: Locator = this.page.getByText('Are you certain you want to delete this record?');
  private readonly deleteConfirmButton: Locator = this.page.getByRole('button', { name: 'Yes, Delete It!' });
  private readonly deleteSuccessToast: Locator = this.page.getByText('Your data has been successfully deleted.');

  constructor(page: Page) {
    super(page);
  }

  // ===================== List =====================

  async gotoList(): Promise<void> {
    await this.goto('/shift-templates');
    await expect(this.heading('Shift Template List')).toBeVisible();
  }

  rowByTemplateName(name: string): Locator {
    return this.templateRows.filter({ hasText: name }).first();
  }

  async searchTemplate(name: string): Promise<void> {
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(1500);
  }

  async expectRowVisible(name: string): Promise<void> {
    await expect(this.rowByTemplateName(name)).toBeVisible({ timeout: 10000 });
  }

  async expectRowHidden(name: string): Promise<void> {
    await expect(this.rowByTemplateName(name)).toHaveCount(0, { timeout: 10000 });
  }

  async expectRowContainsText(name: string, text: string | RegExp): Promise<void> {
    await expect(this.rowByTemplateName(name)).toContainText(text);
  }

  async expectFieldError(message: string | RegExp): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.savedSuccessToast).toBeVisible({ timeout: 10000 });
  }

  // ===================== Create / Edit =====================

  async openCreateModal(): Promise<void> {
    await this.addButton.click();
    await expect(this.nameInput).toBeVisible();
  }

  async fillCreateForm(data: {
    name: string;
    company?: string;
    businessUnit?: string;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
    requiredClockInOut?: boolean;
    requiredBreak?: boolean;
    isDefault?: boolean;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.company) await this.selectMultiselect(0, data.company);
    if (data.businessUnit) await this.selectMultiselect(1, data.businessUnit);

    if (data.requiredClockInOut) await this.requiredClockInOutLabel.click();
    await this.startTimeInput.fill(data.startTime);
    await this.endTimeInput.fill(data.endTime);

    if (data.requiredBreak) await this.requiredBreakLabel.click();
    if (data.breakStartTime) await this.breakStartTimeInput.fill(data.breakStartTime);
    if (data.breakEndTime) await this.breakEndTimeInput.fill(data.breakEndTime);

    if (data.isDefault) await this.isDefaultLabel.click();
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click({ force: true });
    await this.expectSuccessToast();
  }

  async clickCreateExpectError(): Promise<void> {
    await this.createButton.click({ force: true });
  }

  async closeModal(): Promise<void> {
    await this.cancelButton.click({ force: true });
    await expect(this.nameInput).toBeHidden();
  }

  // ===================== Edit =====================

  editButtonInRow(name: string): Locator {
    return this.rowByTemplateName(name).locator('a:has(.lucide-pencil-icon)');
  }

  deleteButtonInRow(name: string): Locator {
    return this.rowByTemplateName(name).locator('a:has(.lucide-trash-2)');
  }

  async openEditModal(name: string): Promise<void> {
    await this.editButtonInRow(name).click();
    await expect(this.nameInput).toBeVisible();
  }

  async fillTemplateName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async setStatus(status: string): Promise<void> {
    await this.statusSelect.selectOption({ label: status });
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click({ force: true });
    await this.expectSuccessToast();
  }

  async clickSaveExpectError(): Promise<void> {
    await this.saveButton.click({ force: true });
  }

  // ===================== Delete =====================

  async clickDelete(name: string): Promise<void> {
    await this.deleteButtonInRow(name).click();
    await expect(this.deleteConfirmText).toBeVisible();
  }

  async confirmDelete(): Promise<void> {
    await this.deleteConfirmButton.click();
    await expect(this.deleteSuccessToast).toBeVisible({ timeout: 10000 });
  }

  async expectDeleteButtonHidden(name: string): Promise<void> {
    await expect(this.deleteButtonInRow(name)).toHaveCount(0);
  }

  async expectDeleteButtonVisible(name: string): Promise<void> {
    await expect(this.deleteButtonInRow(name)).toBeVisible();
  }

  // ===================== List columns =====================

  async expectColumns(headers: string[]): Promise<void> {
    for (const header of headers) {
      await expect(this.page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    }
  }

  private async selectMultiselect(index: number, text: string): Promise<void> {
    const wrapper = this.multiselects.nth(index);
    const search = wrapper.locator('input.multiselect-tags-search');
    await search.click({ force: true });
    await search.pressSequentially(text, { delay: 40 });
    await wrapper.locator('li[role="option"]').first().click({ force: true });
    await this.page.keyboard.press('Escape');
  }
}
