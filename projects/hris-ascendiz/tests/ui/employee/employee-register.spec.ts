import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test, expect } from '@shared/fixtures/ui.fixture';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test('Register new employee with all required fields', async ({ page }) => {
  // Login — reuse storage from auth.setup
  await page.goto('https://staging.zappy.my.id/');
  await expect(page.getByRole('heading', { name: 'Contract Employees Expiracy' })).toBeVisible();

  // Navigate to Employee Management > Employee Data
  await page.getByRole('link', { name: /Employee Management/ }).click();
  await page.getByRole('link', { name: 'Employee Data' }).click();
  await expect(page.getByRole('heading', { name: 'Employee List' })).toBeVisible();

  // Click Add Employee
  await page.getByRole('button', { name: 'Add Employee' }).click();
  await expect(page.getByRole('heading', { name: 'Register Employee' })).toBeVisible();

  // --- Tab 1: Employee Data ---

  // Account Info
  await page.getByRole('textbox', { name: 'Enter username' }).fill('feri');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('feri@gmail.com');
  await page.getByRole('textbox', { name: 'Phone number' }).fill('81234567890');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test_123');

  // Personal Info
  await page.getByRole('textbox', { name: 'Enter your first name' }).fill('Feri');
  await page.getByRole('textbox', { name: 'Enter your last name' }).fill('Kun');
  await page.locator('#gender').selectOption('Male');

  // Date of Birth — flatpickr datepicker
  await page.getByRole('textbox', { name: 'Select date' }).first().click();
  const yearInput = page.getByRole('spinbutton', { name: 'Year' });
  await yearInput.fill('1990');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 15,"]').click();

  await page.getByRole('textbox', { name: 'Enter your place of birth' }).fill('Jakarta');
  await page.locator('#last-education').selectOption('S1 (Sarjana)');
  await page.getByRole('textbox', { name: 'Enter Institution' }).fill('Universitas Indonesia');
  await page.getByRole('textbox', { name: 'Enter KTP Number' }).fill('1234567890123456');
  await page.getByRole('textbox', { name: 'Search Nationality' }).click();
  await page.getByRole('textbox', { name: 'Search Nationality' }).fill('Indonesia');
  await page.getByText('Indonesia', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Enter your personal email' }).fill('feri@gmail.com');
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
  await page.getByRole('spinbutton', { name: 'Year' }).fill('2026');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 16,"]').click();

  // Permanent Hire Date
  await page.getByRole('textbox', { name: 'Select date' }).nth(1).click();
  await page.getByRole('spinbutton', { name: 'Year' }).fill('2026');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 16,"]').click();

  // Manager Name
  await page.getByText('Select Manager').first().click();
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
  await page.getByRole('textbox', { name: 'Enter account number' }).fill('1234567890');
  await page.getByRole('textbox', { name: 'Enter account holder' }).fill('Feri');
  await page.locator('#cost-center').selectOption('In-Direct');
  await page.getByRole('checkbox', { name: 'Has NPWP' }).check();
  await page.getByRole('textbox', { name: 'Enter NPWP' }).fill('123456789012345');
  await page.getByRole('textbox', { name: 'Select date' }).last().click();
  await page.getByRole('spinbutton', { name: 'Year' }).fill('2026');
  await page.locator('.flatpickr-calendar.open [aria-label*="July 16,"]').click();
  await page.locator('#tax-marital-status').selectOption('TK/0');

  // Save payroll
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify success — form saved without validation errors
  await expect(page.getByText('is required')).toHaveCount(0, { timeout: 5000 });
});
