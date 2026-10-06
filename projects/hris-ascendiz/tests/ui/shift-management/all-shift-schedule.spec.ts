import { APIRequestContext, Page } from '@playwright/test';
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test } from '@shared/fixtures/ui.fixture';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';
import { ApiFixture } from '@shared/fixtures/api.fixture';
import { AllShiftSchedulePage, DashboardPage, LoginPage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

// Id schedule/transaksi yang dibuat lewat UI, untuk cleanup setelah setiap test.
const createdScheduleIds: number[] = [];
const createdTransactionIds: number[] = [];

function trackCreatedSchedules(page: Page): void {
  page.on('response', async (res) => {
    if (res.request().method() !== 'POST' || !/\/shifts\/transactions/.test(res.url())) return;
    const body = await res.json().catch(() => null);
    for (const trx of body?.data?.transactions || []) {
      if (trx.transaction_id) createdTransactionIds.push(trx.transaction_id);
      for (const id of trx.schedule_ids || []) createdScheduleIds.push(id);
    }
  });
}

// =====================================================================
// Module Shift Management — Submodule All Shift Schedule
// Status mengacu pada docs/ui-flow/Shift Management.md:
//   [In Progress] SM-SC-001 s/d SM-SC-010
// =====================================================================

test.describe('Shift Management - All Shift Schedule [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  const employee = 'Auto Test';
  const location = 'Ascendiz Intermoda';

  test('SM-SC-001: Melihat seluruh shift schedule yang berbentuk kalender', async ({ page }) => {
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.expectWeeklyCalendar();
    await allShiftSchedule.expectEmployeeRows();
  });

  test.describe('Manager Role', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('SM-SC-002: Melihat seluruh shift schedule untuk karyawan bawahannya', async ({ page }) => {
      const login = new LoginPage(page);
      await login.login(process.env.MANAGER_EMAIL as string, process.env.MANAGER_PASSWORD as string);
      await new DashboardPage(page).expectDashboardVisible();

      const allShiftSchedule = new AllShiftSchedulePage(page);
      await allShiftSchedule.gotoSubordinate();
      await allShiftSchedule.expectWeeklyCalendar();
      await allShiftSchedule.expectEmployeeRows();
    });
  });

  test('SM-SC-003: Membuat penugasan shift bertipe shift template pada employee tertentu', async ({ page }) => {
    trackCreatedSchedules(page);
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.createSchedule({
      type: 'Shift Template',
      employee,
      location,
      template: 'Morning Shift 45',
    });

    await allShiftSchedule.expectSuccessToast();
    await allShiftSchedule.expectShiftAssigned(employee);
  });

  test('SM-SC-004: Membuat penugasan shift bertipe manual shift pada employee tertentu', async ({ page }) => {
    trackCreatedSchedules(page);
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.createSchedule({
      type: 'Manual Schedule',
      employee,
      location,
      startTime: '09:00',
      endTime: '17:00',
      breakStartTime: '12:00',
      breakEndTime: '13:00',
    });

    await allShiftSchedule.expectSuccessToast();
    await allShiftSchedule.expectShiftAssigned(employee);
  });

  test('SM-SC-005: Menghapus shift yang sudah ditugaskan ke karyawan tertentu', async ({ page }) => {
    trackCreatedSchedules(page);
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.createSchedule({
      type: 'Manual Schedule',
      employee,
      location,
      startTime: '09:00',
      endTime: '17:00',
    });
    await allShiftSchedule.expectSuccessToast();

    await allShiftSchedule.clickShiftBoxToday(employee);
    await allShiftSchedule.deleteShiftFromPopup();
    await allShiftSchedule.confirmDelete();
  });

  test('SM-SC-006: Membuat penugasan multiple shift untuk karyawan tertentu', async ({ page }) => {
    trackCreatedSchedules(page);
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.createSchedule({
      type: 'Manual Schedule',
      employee,
      location,
      startTime: '09:00',
      endTime: '11:00',
    });
    await allShiftSchedule.expectSuccessToast();

    await allShiftSchedule.createSchedule({
      type: 'Manual Schedule',
      employee,
      location,
      startTime: '13:00',
      endTime: '15:00',
    });
    await allShiftSchedule.expectSuccessToast();

    await allShiftSchedule.expectShiftBoxesAtLeast(employee, 2);
  });

  test('SM-SC-007: Menjalankan multiple filter pada laman All Shift Schedule', async ({ page }) => {
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.selectFilterLocation(location);
    await allShiftSchedule.selectFilterDepartment('Dept. Operations');
    await allShiftSchedule.selectFilterShift('Morning Shift 45');

    // Filter terpasang sesuai pilihan; tabel kalender tetap dirender
    await allShiftSchedule.expectFilterApplied({
      location,
      department: 'Dept. Operations',
      shift: 'Morning Shift 45',
    });
    await allShiftSchedule.expectWeeklyCalendar();
  });

  test('SM-SC-008: Mengedit shift yang sudah ditugaskan ke karyawan tertentu', async ({ page }) => {
    trackCreatedSchedules(page);
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.createSchedule({
      type: 'Manual Schedule',
      employee,
      location,
      startTime: '09:00',
      endTime: '11:00',
    });
    await allShiftSchedule.expectSuccessToast();

    await allShiftSchedule.updateShiftEndTime(employee, '12:00');
    await allShiftSchedule.expectSuccessToast();
    await allShiftSchedule.expectShiftContains(employee, '12:00');
  });

  test('SM-SC-009: Membuat penugasan shift bertipe long shift pada employee tertentu', async ({ page }) => {
    trackCreatedSchedules(page);
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.createSchedule({
      type: 'Long Shift',
      employee,
      location,
      startTime: '09:00',
      endTime: '17:00',
      breakStartTime: '12:00',
      breakEndTime: '13:00',
    });

    await allShiftSchedule.expectSuccessToast();
    await allShiftSchedule.expectShiftAssigned(employee);
  });

  test('SM-SC-010: Membuat multiple shift dengan waktu overlap (negatif)', async ({ page }) => {
    trackCreatedSchedules(page);
    const allShiftSchedule = new AllShiftSchedulePage(page);

    await allShiftSchedule.goto();
    await allShiftSchedule.createSchedule({
      type: 'Manual Schedule',
      employee,
      location,
      startTime: '09:00',
      endTime: '17:00',
    });
    await allShiftSchedule.expectSuccessToast();

    // Shift kedua yang jamnya bertabrakan
    await allShiftSchedule.createSchedule({
      type: 'Manual Schedule',
      employee,
      location,
      startTime: '10:00',
      endTime: '12:00',
    });
    await allShiftSchedule.expectOverlapError();
    await allShiftSchedule.closeModal();
  });

  // Cleanup setelah setiap test: hapus schedule/transaksi yang dibuat lewat UI
  test.afterEach(async ({ playwright }, testInfo) => {
    if (!createdScheduleIds.length && !createdTransactionIds.length) return;

    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext: APIRequestContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    const api = new ApiFixture(apiContext, testInfo);

    for (const id of createdScheduleIds.splice(0)) {
      await api.delete(ENDPOINTS.SHIFTS.SCHEDULE_BY_ID(id), { resTitle: `Cleanup: Delete Schedule ${id}` }).catch(() => {});
    }
    for (const id of createdTransactionIds.splice(0)) {
      await api.delete(ENDPOINTS.SHIFTS.TRANSACTION_BY_ID(id), { resTitle: `Cleanup: Delete Transaction ${id}` }).catch(() => {});
    }

    await apiContext.dispose();
  });
});
