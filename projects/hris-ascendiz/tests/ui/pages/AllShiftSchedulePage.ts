import { Locator, Page } from '@playwright/test';
import { expect } from '@shared/fixtures/ui.fixture';
import { BasePage } from './BasePage';

/**
 * Page object untuk modul Shift Management (All Shift Schedule).
 * Fokus saat ini: modal Create Work Schedule (dipakai untuk verifikasi shift template non-aktif).
 */
export class AllShiftSchedulePage extends BasePage {
  private readonly createButton: Locator = this.page.getByRole('button', { name: 'Create Work Schedule' });
  private readonly scheduleTypeSelect: Locator = this.page.locator('#scheduleType');
  private readonly templateSelect: Locator = this.page.locator('#schedule_template_1');
  private readonly cancelButton: Locator = this.page.getByRole('button', { name: 'Cancel', exact: true });

  // --- Create Work Schedule modal (form) ---
  private readonly employeeSelect: Locator = this.page.locator('#search_employee');
  private readonly locationSelect: Locator = this.page.locator('input#location').nth(1);
  private readonly scheduleDateInput: Locator = this.page.getByPlaceholder('Select date').first();
  private readonly notesInput: Locator = this.page.getByPlaceholder('Write Notes');
  private readonly submitButton: Locator = this.page.getByRole('button', { name: 'Create', exact: true });
  private readonly successToast: Locator = this.page.getByText('Your data has been successfully saved.');

  // --- Calendar grid + edit/delete popup ---
  private readonly calendarRows: Locator = this.page.locator('table tbody tr');
  private readonly deleteConfirmButton: Locator = this.page.getByRole('button', { name: 'Yes, Delete It!' });
  private readonly updateButton: Locator = this.page.getByRole('button', { name: 'Update', exact: true });
  private readonly overlapError: Locator = this.page.getByText(/overlaps with an existing shift/);

  // --- Filter bar ---
  private readonly filterLocation: Locator = this.page.locator('input#location').first();
  private readonly filterDepartment: Locator = this.page.locator('#departments');
  private readonly filterShift: Locator = this.page.locator('#shift');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/all-shifts');
    await expect(this.heading('All Shift Schedule')).toBeVisible();
  }

  async gotoSubordinate(): Promise<void> {
    await this.page.goto('/subordinate-shifts');
    await expect(this.heading('Subordinate Shift List')).toBeVisible();
  }

  /** Tabel kalender per minggu: kolom employee + 7 hari (Sun..Sat). */
  async expectWeeklyCalendar(): Promise<void> {
    const headers = this.page.locator('table thead th');
    await expect(headers).toHaveCount(8);
    for (let i = 1; i <= 7; i++) {
      await expect(headers.nth(i)).toContainText(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat),/);
    }
  }

  /** Setiap employee memiliki barisnya masing-masing. */
  async expectEmployeeRows(): Promise<void> {
    const rows = this.page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(rows.first()).toBeVisible();
  }

  async openCreateModal(): Promise<void> {
    await this.createButton.first().click();
    await expect(this.scheduleTypeSelect).toBeVisible();
  }

  async selectScheduleType(label: string): Promise<void> {
    await this.scheduleTypeSelect.selectOption({ label });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Buka dropdown Shift Template dan pastikan tidak ada opsi yang cocok dengan `name`
   * (mis. untuk membuktikan shift template non-aktif tidak muncul).
   */
  async expectShiftTemplateOptionAbsent(name: string): Promise<void> {
    await this.templateSelect.click({ force: true });
    await this.templateSelect.fill(name);
    await this.page.waitForTimeout(1500);
    const options = this.templateSelect.locator('xpath=..').locator('li');
    await expect(options.filter({ hasText: name })).toHaveCount(0);
  }

  async closeModal(): Promise<void> {
    await this.cancelButton.click({ force: true });
    await expect(this.scheduleTypeSelect).toBeHidden();
  }

  // ===================== Create Work Schedule (assignment) =====================

  async selectEmployee(name: string): Promise<void> {
    await this.pickOption(this.employeeSelect, name);
  }

  async selectLocation(name: string): Promise<void> {
    await this.pickOption(this.locationSelect, name);
  }

  async selectShiftTemplate(name: string): Promise<void> {
    await this.pickOption(this.templateSelect, name);
  }

  async selectScheduleDateToday(): Promise<void> {
    await this.scheduleDateInput.click();
    await this.page.locator('.flatpickr-calendar.open .flatpickr-day.today').click();
  }

  async fillManualTimes(data: {
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
  }): Promise<void> {
    await this.page.getByPlaceholder('09:00').first().fill(data.startTime);
    await this.page.getByPlaceholder('17:00').first().fill(data.endTime);
    if (data.breakStartTime) await this.page.getByPlaceholder('12:00').first().fill(data.breakStartTime);
    if (data.breakEndTime) await this.page.getByPlaceholder('13:00').first().fill(data.breakEndTime);
  }

  async setNotes(text: string): Promise<void> {
    await this.notesInput.fill(text);
  }

  async clickCreate(): Promise<void> {
    await this.submitButton.click({ force: true });
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: 10000 });
  }

  // ===================== Calendar cell (today column) =====================

  rowByEmployee(name: string): Locator {
    return this.calendarRows.filter({ hasText: name }).first();
  }

  /** Kolom indeks 0 = employee, 1..7 = Sun..Sat. */
  cellForToday(name: string): Locator {
    return this.rowByEmployee(name).locator('td').nth(new Date().getDay() + 1);
  }

  private shiftBoxInToday(name: string): Locator {
    return this.cellForToday(name).locator('span').filter({ hasText: /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/ }).first();
  }

  async expectShiftAssigned(name: string): Promise<void> {
    await expect(this.shiftBoxInToday(name)).toBeVisible({ timeout: 10000 });
  }

  async clickShiftBoxToday(name: string): Promise<void> {
    await this.shiftBoxInToday(name).click();
  }

  async deleteShiftFromPopup(): Promise<void> {
    await this.page.getByRole('button', { name: /delete/i }).click();
  }

  async confirmDelete(): Promise<void> {
    await this.deleteConfirmButton.click();
  }

  // ===================== Create (generic) =====================

  async createSchedule(data: {
    type: string;
    employee: string;
    location: string;
    template?: string;
    startTime?: string;
    endTime?: string;
    breakStartTime?: string;
    breakEndTime?: string;
    notes?: string;
  }): Promise<void> {
    await this.openCreateModal();
    await this.selectScheduleType(data.type);
    await this.selectEmployee(data.employee);
    await this.selectLocation(data.location);
    await this.selectScheduleDateToday();
    if (data.template) await this.selectShiftTemplate(data.template);
    if (data.startTime && data.endTime) {
      await this.fillManualTimes({
        startTime: data.startTime,
        endTime: data.endTime,
        breakStartTime: data.breakStartTime,
        breakEndTime: data.breakEndTime,
      });
    }
    if (data.notes) await this.setNotes(data.notes);
    await this.clickCreate();
  }

  // ===================== Edit =====================

  async updateShiftEndTime(name: string, endTime: string): Promise<void> {
    await this.clickShiftBoxToday(name);
    await this.page.getByPlaceholder('17:00').first().fill(endTime);
    await this.updateButton.click({ force: true });
  }

  async expectOverlapError(): Promise<void> {
    await expect(this.overlapError).toBeVisible({ timeout: 10000 });
  }

  async expectShiftContains(name: string, text: string): Promise<void> {
    await expect(this.shiftBoxInToday(name)).toContainText(text);
  }

  async expectShiftBoxesAtLeast(name: string, count: number): Promise<void> {
    await expect
      .poll(async () => this.cellForToday(name).locator('span').filter({ hasText: /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/ }).count(), {
        timeout: 10000,
      })
      .toBeGreaterThanOrEqual(count);
  }

  // ===================== Filters =====================

  async selectFilterLocation(name: string): Promise<void> {
    await this.pickOption(this.filterLocation, name);
  }

  async selectFilterDepartment(name: string): Promise<void> {
    await this.pickOption(this.filterDepartment, name);
  }

  async selectFilterShift(name: string): Promise<void> {
    await this.pickOption(this.filterShift, name);
  }

  async expectFilterApplied(data: { location: string; department: string; shift: string }): Promise<void> {
    await expect(this.filterLocation).toHaveValue(data.location);
    await expect(this.filterDepartment).toHaveValue(data.department);
    await expect(this.filterShift).toHaveValue(data.shift);
  }

  private async pickOption(input: Locator, text: string): Promise<void> {
    await input.click({ force: true });
    await input.pressSequentially(text, { delay: 40 });
    await this.page.waitForTimeout(1200);
    await input
      .locator('xpath=ancestor::div[.//ul][1]')
      .locator('li')
      .filter({ hasText: text })
      .first()
      .click({ force: true });
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }
}
