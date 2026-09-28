import { Locator, Page } from '@playwright/test';
import { expect } from '@shared/fixtures/ui.fixture';
import { BasePage } from './BasePage';

/**
 * Page object untuk modul Office List (Location).
 * Mencakup location list, form create/edit, detail, dan delete.
 */
export class LocationPage extends BasePage {
  // --- Location List ---
  private readonly searchInput: Locator = this.page.getByPlaceholder('Search by name...');
  private readonly locationRows: Locator = this.page.locator('table tbody tr');

  // --- Add Location form (create & edit) ---
  private readonly nameInput: Locator = this.page.getByPlaceholder('Enter Location name');
  private readonly codeInput: Locator = this.page.getByPlaceholder('Enter Location code');
  private readonly emailInput: Locator = this.page.getByPlaceholder('Enter Location email');
  private readonly phoneInput: Locator = this.page.getByPlaceholder('Enter phone number');
  private readonly faxInput: Locator = this.page.getByPlaceholder('Enter fax');
  private readonly businessUnitInput: Locator = this.page.locator('#location-business-unit');
  private readonly addressInput: Locator = this.page.getByPlaceholder('Enter Address');
  private readonly provinceSelect: Locator = this.page.locator('#location-province');
  private readonly cityInput: Locator = this.page.locator('#location-city');
  private readonly postalCodeInput: Locator = this.page.getByPlaceholder('Enter postal code');
  private readonly latitudeInput: Locator = this.page.getByPlaceholder('Enter latitude');
  private readonly longitudeInput: Locator = this.page.getByPlaceholder('Enter longitude');
  private readonly radiusInput: Locator = this.page.getByPlaceholder('Enter office location radius');
  private readonly officeStatusSelect: Locator = this.page.locator('#location-office-status');
  private readonly attendanceMobileRadio: Locator = this.page.locator('#attendance-gps');
  private readonly taxNameInput: Locator = this.page.getByPlaceholder('Enter Location tax name');
  private readonly nitkuInput: Locator = this.page.getByPlaceholder('Enter Location NITKU');
  private readonly npwp15Input: Locator = this.page.getByPlaceholder('00.000.000.0-000.000');
  private readonly npwp16Input: Locator = this.page.getByPlaceholder('0000 0000 0000 0000');
  private readonly taxHolderNameInput: Locator = this.page.getByPlaceholder('Enter tax holder name');
  private readonly kluCodeInput: Locator = this.page.getByPlaceholder('Enter KLU code');
  private readonly jhtPaymentSelect: Locator = this.page.locator('#location-jht-payment');
  private readonly bpjsPaymentSelect: Locator = this.page.locator('#location-bpjs-payment');
  private readonly saveButton: Locator = this.page.getByRole('button', { name: 'Save', exact: true });

  // --- Delete confirmation modal ---
  private readonly deleteConfirmButton: Locator = this.page.getByRole('button', { name: 'Yes, Delete It!' });

  constructor(page: Page) {
    super(page);
  }

  // ===================== Location List =====================

  async gotoList(): Promise<void> {
    await this.goto('/locations');
    await expect(this.heading('Location List')).toBeVisible();
  }

  async clickAddLocation(): Promise<void> {
    await this.menuLink('Add Location').click();
    await expect(this.heading('Add Location')).toBeVisible();
  }

  async searchLocation(name: string): Promise<void> {
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(1500);
  }

  get rows(): Locator {
    return this.locationRows;
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  rowByLocationName(name: string): Locator {
    return this.locationRows.filter({ hasText: name }).first();
  }

  async expectRowVisible(name: string): Promise<void> {
    await expect(this.rowByLocationName(name)).toBeVisible({ timeout: 10000 });
  }

  async expectRowHidden(name: string): Promise<void> {
    await expect(this.rowByLocationName(name)).toHaveCount(0, { timeout: 10000 });
  }

  async openDetail(name: string): Promise<void> {
    const row = this.rowByLocationName(name);
    await row.locator('a[href*="/location/"]').first().click();
  }

  async openEdit(name: string): Promise<void> {
    const row = this.rowByLocationName(name);
    await row.locator('a[href*="/edit"]').click();
    await expect(this.heading('Edit Location')).toBeVisible();
  }

  async clickDelete(name: string): Promise<void> {
    const row = this.rowByLocationName(name);
    await row.locator('a[href="#!"]').click();
    await expect(this.page.getByText('Are you certain you want to delete this record?')).toBeVisible();
  }

  async confirmDelete(): Promise<void> {
    await this.deleteConfirmButton.click();
    await expect(this.page.getByText('Your data has been successfully deleted.')).toBeVisible({ timeout: 10000 });
  }

  // ===================== Form (create & edit) =====================

  async fillGeneralInfo(data: {
    name: string;
    code: string;
    email: string;
    phone: string;
    fax: string;
    businessUnit: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.codeInput.fill(data.code);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.faxInput.fill(data.fax);
    await this.selectBusinessUnit(data.businessUnit);
  }

  async selectBusinessUnit(name: string): Promise<void> {
    await this.businessUnitInput.click();
    await this.page.locator('li', { hasText: name }).click();
  }

  async fillAddress(data: {
    address: string;
    province: string;
    city: string;
    postalCode: string;
    latitude: string;
    longitude: string;
    radius: string;
  }): Promise<void> {
    await this.addressInput.fill(data.address);
    await this.provinceSelect.selectOption({ label: data.province });
    await this.cityInput.click();
    await this.page.locator('[role="option"]', { hasText: data.city }).click();
    await this.postalCodeInput.fill(data.postalCode);
    await this.latitudeInput.fill(data.latitude);
    await this.longitudeInput.fill(data.longitude);
    await this.radiusInput.fill(data.radius);
    await this.officeStatusSelect.selectOption({ label: 'Active' });
    await this.attendanceMobileRadio.check({ force: true });
  }

  async fillTaxInfo(data: {
    taxName: string;
    nitku: string;
    npwp15: string;
    npwp16: string;
    taxHolderName: string;
    taxHolderNpwp15: string;
    taxHolderNpwp16: string;
    kluCode: string;
  }): Promise<void> {
    await this.taxNameInput.fill(data.taxName);
    await this.nitkuInput.fill(data.nitku);
    await this.npwp15Input.first().fill(data.npwp15);
    await this.npwp16Input.first().fill(data.npwp16);
    await this.taxHolderNameInput.fill(data.taxHolderName);
    await this.npwp15Input.nth(1).fill(data.taxHolderNpwp15);
    await this.npwp16Input.nth(1).fill(data.taxHolderNpwp16);
    await this.kluCodeInput.fill(data.kluCode);
    await this.jhtPaymentSelect.selectOption({ label: 'Paid by Employee' });
    await this.bpjsPaymentSelect.selectOption({ label: 'Paid by Employee' });
  }

  async saveForm(): Promise<void> {
    await this.saveButton.click();
    await expect(this.page.getByText('Your data has been successfully saved.')).toBeVisible({ timeout: 10000 });
  }

  async saveFormExpectError(): Promise<void> {
    await this.saveButton.click();
  }

  async expectEditSaved(): Promise<void> {
    await expect(this.page.getByText('Your data has been successfully saved.')).toBeVisible({ timeout: 10000 });
  }

  async expectErrorVisible(message: string | RegExp): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  // ===================== Detail =====================

  async expectDetailVisible(): Promise<void> {
    await expect(this.heading('Location Details')).toBeVisible();
  }

  async expectDetailValue(label: string, value: string): Promise<void> {
    const labelEl = this.page.locator('div', { hasText: label }).filter({ has: this.page.locator('p, div, h6, span') }).first();
    const section = labelEl.locator('xpath=..');
    await expect(section).toContainText(value);
  }

  get detailNameValue(): Locator {
    // Label "Location Name" ada di grid item, nilai berada di sibling grid item berikutnya
    return this.page
      .locator('div.font-semibold', { hasText: 'Location Name' })
      .locator('xpath=following-sibling::div[1]')
      .first();
  }
}
