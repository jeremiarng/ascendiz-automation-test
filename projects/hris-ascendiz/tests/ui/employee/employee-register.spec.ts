import { faker } from '@faker-js/faker';
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test } from '@shared/fixtures/ui.fixture';
import { EmployeePage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Employee Register - Positive Cases', { tag: ['@ui', '@regression'] }, () => {
  // Unique data per run — email unik menghindari "already registered",
  // nama belakang unik agar employee bisa dicari & dihapus saat cleanup.
  const suffix = faker.string.alphanumeric(5);
  const username = `feri${suffix}`;
  const email = `${username}@gmail.com`;
  const lastName = `Kun${suffix}`;
  const employeeName = `Feri ${lastName}`;

  test('Register new employee with all required fields', async ({ page }) => {
    const employee = new EmployeePage(page);

    await employee.gotoEmployeeList();
    await employee.openRegisterForm();

    // --- Tab 1: Employee Data ---
    await employee.fillAccountInfo({
      username,
      email,
      phone: '81234567890',
      password: 'Test_123',
    });

    await employee.fillPersonalInfo({
      firstName: 'Feri',
      lastName,
      gender: 'Male',
      birthDate: { year: '1990', month: 'August', day: 'August 15, 1990' },
      placeOfBirth: 'Jakarta',
      lastEducation: 'S1 (Sarjana)',
      institution: 'Universitas Indonesia',
      ktpNumber: faker.string.numeric(16),
      nationality: 'Indonesia',
      personalEmail: email,
      religion: 'Islam',
      maritalStatus: 'Single',
      bloodType: 'A',
    });

    await employee.fillKtpAddress({
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      subDistrict: 'Cipete',
      postalCode: '12345',
      rt: '001',
      rw: '002',
      details: 'Jl. Cipete Raya No. 10',
    });

    await employee.saveEmployeeDataTab();

    // --- Tab 2: Employment Data ---
    await employee.next();
    await employee.fillEmploymentData({
      employeeType: 'Permanent',
      employeeStatus: 'Active',
      company: 'PT. Pendidikan Anak Bangsa',
      division: 'Hr & Ga',
      department: 'Hr Operations',
      businessUnit: 'Shared Service',
      jobTitle: 'Generalist',
      managementLevel: 'Associate',
      location: 'Ascendiz Intermoda',
      hireDate: { year: '2026', day: 'July 29, 2026' },
      permanentHireDate: { year: '2026', day: 'July 29, 2026' },
      permanentEndDate: { year: '2026', day: 'July 29, 2026' },
      manager: { code: '2025060103', label: 'Admin 7R2' },
    });
    await employee.saveEmploymentDataTab();

    // --- Tab 3: Payroll (verifikasi toast sukses ada di dalam method) ---
    await employee.next();
    await employee.fillPayroll({
      basicSalary: '5000000',
      jshkStatus: 'Active',
      workingSchedule: '5-2',
      bankName: 'Bank Central Asia',
      bankBranch: 'Jakarta',
      accountNumber: faker.string.numeric(10),
      accountHolder: 'Feri',
      costCenter: 'In-Direct',
      npwp: '123456789012345',
      npwpDate: { year: '2026', day: 'July 29, 2026' },
      taxMaritalStatus: 'TK/0',
    });
  });

  // Cleanup: hapus employee yang dibuat setelah seluruh test selesai,
  // meskipun test gagal di tengah jalan.
  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: process.env.HRIS_WEB_URL,
      storageState: '.auth/hris-admin.json',
    });
    const page = await context.newPage();
    const employee = new EmployeePage(page);

    await employee.gotoList();
    await employee.searchEmployee(employeeName);
    if (await employee.isEmployeeRowVisible(employeeName)) {
      await employee.deleteEmployee(employeeName);
    }

    await context.close();
  });
});
