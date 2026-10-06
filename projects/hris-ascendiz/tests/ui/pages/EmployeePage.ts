import { Locator, Page } from '@playwright/test';
import { expect } from '@shared/fixtures/ui.fixture';
import { BasePage } from './BasePage';

/**
 * Page object untuk modul Employee Management (Register Employee).
 * Mencakup navigasi ke Employee List dan pengisian form register 3 tab
 * (Employee Data, Employment Data, Payroll).
 */
export class EmployeePage extends BasePage {
  // --- Employee List ---
  private readonly addEmployeeButton: Locator = this.page.getByRole('button', { name: 'Bulk Create' });
  private readonly nextButton: Locator = this.page.getByRole('button', { name: 'Next' });
  private readonly listSearchInput: Locator = this.page.getByPlaceholder('Search').first();
  private readonly employeeRows: Locator = this.page.locator('table tbody tr');
  private readonly deleteConfirmText: Locator = this.page.getByText('Are you certain you want to delete this record?');
  private readonly deleteConfirmButton: Locator = this.page.getByRole('button', { name: 'Yes, Delete It!' });

  // --- Tab 1: Employee Data ---
  private readonly usernameInput: Locator = this.page.getByRole('textbox', { name: 'Enter username' });
  private readonly emailInput: Locator = this.page.getByRole('textbox', { name: 'Email Address' });
  private readonly phoneInput: Locator = this.page.getByRole('textbox', { name: 'Phone number' });
  private readonly passwordInput: Locator = this.page.getByRole('textbox', { name: 'Password' });
  private readonly firstNameInput: Locator = this.page.getByRole('textbox', { name: 'Enter your first name' });
  private readonly lastNameInput: Locator = this.page.getByRole('textbox', { name: 'Enter your last name' });
  private readonly genderSelect: Locator = this.page.locator('#gender');
  private readonly dateInput: Locator = this.page.getByRole('textbox', { name: 'Select date' });
  private readonly placeOfBirthInput: Locator = this.page.getByRole('textbox', { name: 'Enter your place of birth' });
  private readonly lastEducationSelect: Locator = this.page.locator('#last-education');
  private readonly institutionInput: Locator = this.page.getByRole('textbox', { name: 'Enter Institution' });
  private readonly ktpNumberInput: Locator = this.page.getByRole('textbox', { name: 'Enter KTP Number' });
  private readonly nationalitySearchInput: Locator = this.page.getByRole('textbox', { name: 'Search Nationality' });
  private readonly personalEmailInput: Locator = this.page.getByRole('textbox', { name: 'Enter your personal email' });
  private readonly religionSelect: Locator = this.page.locator('#religion');
  private readonly maritalStatusSelect: Locator = this.page.locator('#marital-status');
  private readonly bloodTypeSelect: Locator = this.page.locator('#blood-type');

  private readonly ktpProvinceInput: Locator = this.page.getByRole('textbox', { name: 'Enter province' }).first();
  private readonly ktpCityInput: Locator = this.page.getByRole('textbox', { name: 'Enter city' }).first();
  private readonly ktpDistrictInput: Locator = this.page.getByRole('textbox', { name: 'Enter district' }).first();
  private readonly ktpSubDistrictInput: Locator = this.page.getByRole('textbox', { name: 'Enter sub district' }).first();
  private readonly ktpPostalCodeInput: Locator = this.page.getByRole('textbox', { name: 'Enter postal code' }).first();
  private readonly ktpRtInput: Locator = this.page.getByRole('textbox', { name: 'Enter RT' }).first();
  private readonly ktpRwInput: Locator = this.page.getByRole('textbox', { name: 'Enter RW' }).first();
  private readonly ktpAddressDetailsInput: Locator = this.page.getByRole('textbox', { name: 'Enter address details' }).first();
  private readonly sameAsKtpCheckbox: Locator = this.page.getByRole('checkbox', { name: 'Same as KTP Address' });

  private readonly saveFirstButton: Locator = this.page.getByRole('button', { name: 'Save' }).first();
  private readonly saveExactButton: Locator = this.page.getByRole('button', { name: 'Save', exact: true });
  private readonly saveButton: Locator = this.page.getByRole('button', { name: 'Save' });

  // --- Saturdays/Sundays calendar ---
  private readonly openCalendar: Locator = this.page.locator('.flatpickr-calendar.open');
  private readonly yearInput: Locator = this.page.getByRole('spinbutton', { name: 'Year' });

  // --- Tab 3: Payroll ---
  private readonly successToast: Locator = this.page.getByText('Your data has been successfully saved.');

  constructor(page: Page) {
    super(page);
  }

  // ===================== Navigation =====================

  async gotoEmployeeList(): Promise<void> {
    await this.goto('/');
    await expect(this.menuLink('Attendance Management').first()).toBeVisible();
    await this.menuLink(/Employee Management/).click();
    await this.menuLink('Employee Data').click();
    await expect(this.heading('Employee List')).toBeVisible();
  }

  async openRegisterForm(): Promise<void> {
    // "Bulk Create" adalah dropdown: pilih "Add Employee" untuk membuka form register.
    await this.addEmployeeButton.click();
    await this.page.getByText('Add Employee', { exact: true }).click();
    await expect(this.heading('Register Employee')).toBeVisible();
  }

  // ===================== Employee List (search & delete) =====================

  async gotoList(): Promise<void> {
    await this.goto('/employee/list');
    await expect(this.heading('Employee List')).toBeVisible();
  }

  rowByEmployeeName(name: string): Locator {
    return this.employeeRows.filter({ hasText: name }).first();
  }

  async searchEmployee(name: string): Promise<void> {
    await this.listSearchInput.fill(name);
    await this.listSearchInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async isEmployeeRowVisible(name: string): Promise<boolean> {
    return this.rowByEmployeeName(name).isVisible().catch(() => false);
  }

  async deleteEmployee(name: string): Promise<void> {
    const row = this.rowByEmployeeName(name);
    await row.locator('a[href="#!"]').click();
    await expect(this.deleteConfirmText).toBeVisible();
    await this.deleteConfirmButton.click();
    await expect(row).toHaveCount(0, { timeout: 15000 });
  }

  // ===================== Tab 1: Employee Data =====================

  async fillAccountInfo(data: { username: string; email: string; phone: string; password: string }): Promise<void> {
    await this.usernameInput.fill(data.username);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.passwordInput.fill(data.password);
  }

  async fillPersonalInfo(data: {
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: { year: string; month: string; day: string };
    placeOfBirth: string;
    lastEducation: string;
    institution: string;
    ktpNumber: string;
    nationality: string;
    personalEmail: string;
    religion: string;
    maritalStatus: string;
    bloodType: string;
  }): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.genderSelect.selectOption(data.gender);

    await this.pickDate({ trigger: this.dateInput.first(), ...data.birthDate });

    await this.placeOfBirthInput.fill(data.placeOfBirth);
    await this.lastEducationSelect.selectOption(data.lastEducation);
    await this.institutionInput.fill(data.institution);
    await this.ktpNumberInput.fill(data.ktpNumber);

    await this.nationalitySearchInput.click();
    await this.nationalitySearchInput.fill(data.nationality);
    await this.page.getByText(data.nationality, { exact: true }).click();

    await this.personalEmailInput.fill(data.personalEmail);
    await this.religionSelect.selectOption(data.religion);
    await this.maritalStatusSelect.selectOption(data.maritalStatus);
    await this.bloodTypeSelect.selectOption(data.bloodType);
  }

  async fillKtpAddress(data: {
    province: string;
    city: string;
    district: string;
    subDistrict: string;
    postalCode: string;
    rt: string;
    rw: string;
    details: string;
  }): Promise<void> {
    await this.ktpProvinceInput.fill(data.province);
    await this.ktpCityInput.fill(data.city);
    await this.ktpDistrictInput.fill(data.district);
    await this.ktpSubDistrictInput.fill(data.subDistrict);
    await this.ktpPostalCodeInput.fill(data.postalCode);
    await this.ktpRtInput.fill(data.rt);
    await this.ktpRwInput.fill(data.rw);
    await this.ktpAddressDetailsInput.fill(data.details);
    await this.sameAsKtpCheckbox.check();
  }

  async saveEmployeeDataTab(): Promise<void> {
    await this.saveFirstButton.click();
    await expect(this.nextButton).toBeEnabled();
  }

  // ===================== Tab 2: Employment Data =====================

  async fillEmploymentData(data: {
    employeeType: string;
    employeeStatus: string;
    company: string;
    division: string;
    department: string;
    businessUnit: string;
    jobTitle: string;
    managementLevel: string;
    location: string;
    hireDate: { year: string; day: string };
    permanentHireDate: { year: string; day: string };
    permanentEndDate: { year: string; day: string };
    manager: { code: string; label: string };
  }): Promise<void> {
    await this.page.locator('#employe-type').selectOption(data.employeeType);
    await this.page.locator('#employee-status').selectOption(data.employeeStatus);
    await this.page.locator('#company').selectOption(data.company);
    await this.page.locator('#division').selectOption(data.division);
    await this.page.locator('#department').selectOption(data.department);
    await this.page.locator('#business-unit').selectOption(data.businessUnit);
    await this.page.locator('#job-title').selectOption(data.jobTitle);
    await this.page.locator('#manajemen-level').selectOption(data.managementLevel);
    await this.page.locator('#location').selectOption(data.location);

    await this.pickDate({ trigger: this.dateInput.first(), ...data.hireDate });
    // Permanent Hire Date (index 2 — setelah Exit Date; muncul saat Employee Type = Permanent)
    await this.pickDate({ trigger: this.dateInput.nth(2), ...data.permanentHireDate });
    // Permanent End Date
    await this.pickDate({ trigger: this.dateInput.nth(3), ...data.permanentEndDate });

    const managerCombo = this.page.locator('#select-manager-list');
    await managerCombo.click();
    await managerCombo.fill(data.manager.code);
    await this.page.getByRole('option', { name: `${data.manager.code} - ${data.manager.label}` }).click();
  }

  async saveEmploymentDataTab(): Promise<void> {
    await this.saveExactButton.click();
    await expect(this.nextButton).toBeEnabled();
  }

  async next(): Promise<void> {
    await this.nextButton.click();
  }

  // ===================== Tab 3: Payroll =====================

  async fillPayroll(data: {
    basicSalary: string;
    jshkStatus: string;
    workingSchedule: string;
    bankName: string;
    bankBranch: string;
    accountNumber: string;
    accountHolder: string;
    costCenter: string;
    npwp: string;
    npwpDate: { year: string; day: string };
    taxMaritalStatus: string;
  }): Promise<void> {
    await this.page.locator('#basic-salary').getByRole('textbox', { name: 'Rp' }).fill(data.basicSalary);
    await this.page.locator('#jshk-status').selectOption(data.jshkStatus);
    await this.page.locator('#working-schedule').selectOption(data.workingSchedule);
    await this.page.locator('#bank-name').selectOption(data.bankName);
    await this.page.getByRole('textbox', { name: 'Enter bank branch' }).fill(data.bankBranch);
    await this.page.getByRole('textbox', { name: 'Enter account number' }).fill(data.accountNumber);
    await this.page.getByRole('textbox', { name: 'Enter account holder' }).fill(data.accountHolder);
    await this.page.locator('#cost-center').selectOption(data.costCenter);
    await this.page.getByRole('checkbox', { name: 'Has NPWP' }).check();
    await this.page.getByRole('textbox', { name: 'Enter NPWP' }).fill(data.npwp);
    await this.pickDate({ trigger: this.dateInput.last(), ...data.npwpDate });
    await this.page.locator('#tax-marital-status').selectOption(data.taxMaritalStatus);
    await this.saveButton.click();
    await this.expectSuccessToast();
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: 10000 });
  }

  // ===================== Date picker (flatpickr) =====================

  private async pickDate(options: { trigger?: Locator; year?: string; month?: string; day: string }): Promise<void> {
    if (options.trigger) {
      await options.trigger.click();
    }
    if (options.year) {
      await this.yearInput.fill(options.year);
      await this.yearInput.press('Enter');
    }
    if (options.month) {
      await this.openCalendar.locator('.flatpickr-monthDropdown-months').selectOption({ label: options.month });
    }
    await this.openCalendar.locator(`[aria-label*="${options.day}"]`).click();
  }
}
