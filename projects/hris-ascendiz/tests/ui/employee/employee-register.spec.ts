import { faker } from '@faker-js/faker';
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test, expect } from '@shared/fixtures/ui.fixture';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test('Register new employee with all required fields', async ({ page }) => {
  // Unique test data — avoids "email already registered" from previous runs
  const username = `feri${faker.string.alphanumeric(5)}`;
  const email = `${username}@gmail.com`;
  const firstName = 'Feri';
  const lastName = 'Kun';
  const phoneNumber = '81234567890';
  const ktpNumber = faker.string.numeric(16);
  const bankAccountNumber = faker.string.numeric(10);

  // Login — reuse storage from auth.setup
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Attendance Management' }).first()).toBeVisible();

  // Navigate to Employee Management > Employee Data
  await page.getByRole('link', { name: /Employee Management/ }).click();
  await page.getByRole('link', { name: 'Employee Data' }).click();
  await expect(page.getByRole('heading', { name: 'Employee List' })).toBeVisible();

  // Click Add Employee
  await page.getByRole('button', { name: 'Add Employee' }).click();
  await expect(page.getByRole('heading', { name: 'Register Employee' })).toBeVisible();

  // --- Tab 1: Employee Data ---

  // Account Info
  await page.getByRole('textbox', { name: 'Enter username' }).fill(username);
  await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
  await page.getByRole('textbox', { name: 'Phone number' }).fill(phoneNumber);
  await page.getByRole('textbox', { name: 'Password' }).fill('Test_123');

  // Personal Info
  await page.getByRole('textbox', { name: 'Enter your first name' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Enter your last name' }).fill(lastName);
  await page.locator('#gender').selectOption('Male');

  // Date of Birth — flatpickr datepicker
  await page.getByRole('textbox', { name: 'Select date' }).first().click();
  const yearInput = page.getByRole('spinbutton', { name: 'Year' });
  await yearInput.fill('1990');
  await yearInput.press('Enter');
  await page.locator('.flatpickr-calendar.open .flatpickr-monthDropdown-months').selectOption({ label: 'August' });
  await page.locator('.flatpickr-calendar.open [aria-label*="August 15, 1990"]').click();

  await page.getByRole('textbox', { name: 'Enter your place of birth' }).fill('Jakarta');
  await page.locator('#last-education').selectOption('S1 (Sarjana)');
  await page.getByRole('textbox', { name: 'Enter Institution' }).fill('Universitas Indonesia');
  await page.getByRole('textbox', { name: 'Enter KTP Number' }).fill(ktpNumber);
  await page.getByRole('textbox', { name: 'Search Nationality' }).click();
  await page.getByRole('textbox', { name: 'Search Nationality' }).fill('Indonesia');
  await page.getByText('Indonesia', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Enter your personal email' }).fill(email);
  await page.locator('#religion').selectOption('Islam');
  await page.locator('#marital-status').selectOption('Single');
  await page.locator('#blood-type').selectOption('A');

  // KTP Address
  await page.getByRole('textbox', { name: 'Enter province' }).first().fill('DKI Jakarta');
  await page.getByRole('textbox', { name: 'Enter city' }).first().fill('Jakarta Selatan');
  await page.getByRole('textbox', { name: 'Enter district' }).first().fill('Kebayoran Baru');
  await page.getByRole('textbox', { name: 'Enter sub district' }).first().fill('Cipete');
  await page.getByRole('textbox', { name: 'Enter postal code' }).first().fill('12345');
  await page.getByRole('textbox', { name: 'Enter RT' }).first().fill('001');
  await page.getByRole('textbox', { name: 'Enter RW' }).first().fill('002');
  await page.getByRole('textbox', { name: 'Enter address details' }).first().fill('Jl. Cipete Raya No. 10');
  await page.getByRole('checkbox', { name: 'Same as KTP Address' }).check();

  // Save tab 1
  await page.getByRole('button', { name: 'Save' }).first().click();
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

  // --- Tab 2: Employment Data ---
  await page.getByRole('button', { name: 'Next' }).click();

  await page.locator('#employe-type').selectOption('Permanent');
  await page.locator('#employee-status').selectOption('Active');
  await page.locator('#company').selectOption('PT. Pendidikan Anak Bangsa');
  await page.locator('#division').selectOption('Hr & Ga');
  await page.locator('#department').selectOption('Hr Operations');
  await page.locator('#business-unit').selectOption('Shared Service');
  await page.locator('#job-title').selectOption('Generalist');
  await page.locator('#manajemen-level').selectOption('Associate');
  await page.locator('#location').selectOption('Ascendiz Intermoda');

  // Hire Date
  await page.getByRole('textbox', { name: 'Select date' }).first().click();
  const hireYearInput = page.getByRole('spinbutton', { name: 'Year' });
  await hireYearInput.fill('2026');
  await hireYearInput.press('Enter');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 29, 2026"]').click();

  // Permanent Hire Date (index 2 — after Exit Date; revealed by Employee Type = Permanent)
  await page.getByRole('textbox', { name: 'Select date' }).nth(2).click();
  const permYearInput = page.getByRole('spinbutton', { name: 'Year' });
  await permYearInput.fill('2026');
  await permYearInput.press('Enter');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 29, 2026"]').click();

  // Permanent End Date
  await page.getByRole('textbox', { name: 'Select date' }).nth(3).click();
  const permEndYearInput = page.getByRole('spinbutton', { name: 'Year' });
  await permEndYearInput.fill('2026');
  await permEndYearInput.press('Enter');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 29, 2026"]').click();

  // Manager Name — click the combobox search input directly, then search
  const managerCombo = page.locator('#select-manager-list');
  await managerCombo.click();
  await managerCombo.fill('2025060103');
  await page.getByRole('option', { name: '2025060103 - Admin 7R2' }).click();

  // Save tab 2
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

  // --- Tab 3: Payroll ---
  await page.getByRole('button', { name: 'Next' }).click();

  // Tax & Payroll
  await page.locator('#basic-salary').getByRole('textbox', { name: 'Rp' }).fill('5000000');
  await page.locator('#jshk-status').selectOption('Active');
  await page.locator('#working-schedule').selectOption('5-2');
  await page.locator('#bank-name').selectOption('Bank Central Asia');
  await page.getByRole('textbox', { name: 'Enter bank branch' }).fill('Jakarta');
  await page.getByRole('textbox', { name: 'Enter account number' }).fill(bankAccountNumber);
  await page.getByRole('textbox', { name: 'Enter account holder' }).fill('Feri');
  await page.locator('#cost-center').selectOption('In-Direct');
  await page.getByRole('checkbox', { name: 'Has NPWP' }).check();
  await page.getByRole('textbox', { name: 'Enter NPWP' }).fill('123456789012345');
  await page.getByRole('textbox', { name: 'Select date' }).last().click();
  const npwpYearInput = page.getByRole('spinbutton', { name: 'Year' });
  await npwpYearInput.fill('2026');
  await npwpYearInput.press('Enter');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 29, 2026"]').click();
  await page.locator('#tax-marital-status').selectOption('TK/0');

  // Save payroll
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify success — success toast confirms the employee was saved
  await expect(page.getByText('Your data has been successfully saved.')).toBeVisible({ timeout: 10000 });
});
