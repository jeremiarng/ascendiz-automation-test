import { Locator, Page } from '@playwright/test';
import { expect } from '@shared/fixtures/ui.fixture';
import { BasePage } from './BasePage';

/**
 * Page object untuk modul Office List (Office).
 * Mencakup office list, modal create/edit, delete, dan verifikasi data.
 */
export class OfficePage extends BasePage {
  // --- Office List ---
  private readonly officeRows: Locator = this.page.locator('table tbody tr');
  private readonly addOfficeButton: Locator = this.page.getByRole('button', { name: 'Add Office' });

  // --- Office form modal (create & edit share one form: #create-form) ---
  private readonly officeNameInput: Locator = this.page.getByPlaceholder('Enter Office Name');
  private readonly latitudeInput: Locator = this.page.getByPlaceholder('Enter Latitute');
  private readonly longitudeInput: Locator = this.page.getByPlaceholder('Enter Longitude');
  private readonly radiusInput: Locator = this.page.getByPlaceholder('Enter Location Radius');
  private readonly locationInput: Locator = this.page.locator('#selected-location');
  private readonly statusSelect: Locator = this.page.locator('#create-form select');

  private readonly createButton: Locator = this.page.getByRole('button', { name: 'Create', exact: true });
  private readonly editButton: Locator = this.page.getByRole('button', { name: 'Edit', exact: true });
  private readonly cancelButton: Locator = this.page.getByRole('button', { name: 'Cancel', exact: true });

  // --- Delete confirmation modal ---
  private readonly deleteConfirmText: Locator = this.page.getByText('Are you certain you want to delete this record?');
  private readonly deleteConfirmButton: Locator = this.page.getByRole('button', { name: 'Yes, Delete It!' });
  private readonly deleteBlockedMessage: Locator = this.page.getByText('Cannot inactivate or delete office with active employees');

  // --- Toasts ---
  private readonly savedSuccessToast: Locator = this.page.getByText('Your data has been successfully saved.');
  private readonly deleteSuccessToast: Locator = this.page.getByText('Your data has been successfully deleted.');

  constructor(page: Page) {
    super(page);
  }

  // ===================== Office List =====================

  async gotoList(): Promise<void> {
    await this.goto('/office/list');
    await expect(this.heading('Office List')).toBeVisible();
  }

  get rows(): Locator {
    return this.officeRows;
  }

  rowByOfficeName(name: string): Locator {
    return this.officeRows.filter({ hasText: name }).first();
  }

  async expectRowVisible(name: string): Promise<void> {
    await expect(this.rowByOfficeName(name)).toBeVisible({ timeout: 10000 });
  }

  async expectRowHidden(name: string): Promise<void> {
    await expect(this.rowByOfficeName(name)).toHaveCount(0, { timeout: 10000 });
  }

  async expectRowContainsText(name: string, text: string | RegExp): Promise<void> {
    await expect(this.rowByOfficeName(name)).toContainText(text);
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.savedSuccessToast).toBeVisible({ timeout: 10000 });
  }

  async expectFieldError(message: string | RegExp): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  // ===================== Create Office =====================

  async openCreateModal(): Promise<void> {
    await this.addOfficeButton.click();
    await expect(this.officeNameInput).toBeVisible();
  }

  async fillOfficeForm(data: {
    name: string;
    latitude: string;
    longitude: string;
    radius: string;
    location: string;
    status?: string;
  }): Promise<void> {
    await this.officeNameInput.fill(data.name);
    await this.latitudeInput.fill(data.latitude);
    await this.longitudeInput.fill(data.longitude);
    await this.radiusInput.fill(data.radius);
    await this.selectLocation(data.location);
    if (data.status) {
      await this.statusSelect.selectOption({ label: data.status });
    }
  }

  async selectLocation(name: string): Promise<void> {
    await this.locationInput.click({ force: true });
    await this.locationInput.fill(name);
    await this.page.locator('#selected-location-dropdown li', { hasText: name }).first().click({ force: true });
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click({ force: true });
    await this.expectSuccessToast();
  }

  async clickCreateExpectError(): Promise<void> {
    await this.createButton.click({ force: true });
  }

  async expectCreateModalVisible(): Promise<void> {
    await expect(this.officeNameInput).toBeVisible();
  }

  async closeModal(): Promise<void> {
    await this.cancelButton.click({ force: true });
    await expect(this.officeNameInput).toBeHidden();
  }

  // ===================== Edit Office =====================

  async openEditModal(name: string): Promise<void> {
    const row = this.rowByOfficeName(name);
    await row.locator('a.edit-item-btn[href="#!"]').first().click();
    await expect(this.officeNameInput).toBeVisible();
  }

  async fillEditForm(data: {
    name?: string;
    latitude?: string;
    longitude?: string;
    radius?: string;
    status?: string;
  }): Promise<void> {
    if (data.name !== undefined) await this.officeNameInput.fill(data.name);
    if (data.latitude !== undefined) await this.latitudeInput.fill(data.latitude);
    if (data.longitude !== undefined) await this.longitudeInput.fill(data.longitude);
    if (data.radius !== undefined) await this.radiusInput.fill(data.radius);
    if (data.status !== undefined) await this.statusSelect.selectOption({ label: data.status });
  }

  async clickSave(): Promise<void> {
    await this.editButton.click({ force: true });
    await this.expectSuccessToast();
  }

  async clickSaveExpectError(): Promise<void> {
    await this.editButton.click({ force: true });
  }

  // ===================== Delete Office =====================

  async clickDelete(name: string): Promise<void> {
    const row = this.rowByOfficeName(name);
    await row.locator('a.remove-item-btn[href="#!"]').click();
    await expect(this.deleteConfirmText).toBeVisible();
  }

  async confirmDelete(): Promise<void> {
    await this.deleteConfirmButton.click();
    await expect(this.deleteSuccessToast).toBeVisible({ timeout: 10000 });
  }

  /**
   * Konfirmasi delete lalu tunggu salah satu hasil:
   * fitur berhasil (row hilang) atau diblokir sistem (muncul pesan error).
   */
  async confirmDeleteAndWaitOutcome(): Promise<void> {
    await this.deleteConfirmButton.click();
    await this.deleteBlockedMessage
      .or(this.deleteSuccessToast)
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});
  }

  async isDeleteBlocked(): Promise<boolean> {
    return this.deleteBlockedMessage.isVisible().catch(() => false);
  }

  async expectDeleteBlocked(): Promise<void> {
    await expect(this.deleteBlockedMessage).toBeVisible();
  }
}
