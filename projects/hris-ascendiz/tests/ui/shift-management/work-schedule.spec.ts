import { APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test } from '@shared/fixtures/ui.fixture';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';
import { ApiFixture } from '@shared/fixtures/api.fixture';
import { WorkSchedulePage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

// Nama work schedule yang dibuat lewat UI, untuk cleanup setelah setiap test.
const createdNames: string[] = [];

async function deleteSchedulesByNames(
  request: APIRequestContext,
  names: string[],
  testInfo: import('@playwright/test').TestInfo,
): Promise<void> {
  const api = new ApiFixture(request, testInfo);
  for (const name of names) {
    const { responseBody } = await api.get(ENDPOINTS.SCHEDULES.BASE, { search: name, limit: 50, offset: 0 }, {
      resTitle: `Cleanup: Search Work Schedule ${name}`,
    });
    const schedules = responseBody?.schedules || [];
    for (const schedule of schedules) {
      if (schedule.name === name) {
        await api
          .delete(ENDPOINTS.SCHEDULES.BY_ID(schedule.id), { resTitle: `Cleanup: Delete Work Schedule ${name}` })
          .catch(() => {});
      }
    }
  }
}

// =====================================================================
// Module Shift Management — Submodule Work Schedule
// Status mengacu pada docs/ui-flow/Shift Management.md:
//   [In Progress] SM-WS-001 s/d SM-WS-005
// =====================================================================

test.describe('Shift Management - Work Schedule [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  const suffix = faker.string.alphanumeric(6);
  const name1 = `WS_${suffix}`;
  const editedName = `WS_${suffix}_edited`;
  // Waktu unik agar tidak bentrok dengan schedule existing
  const uniqueTimes = { start: '07:15', end: '15:45', breakStart: '11:15', breakEnd: '11:45' };
  // Scope harus spesifik (tidak boleh "All"), jika tidak: "Schedule scope conflicts with existing schedule"
  const company = 'PT. Pendidikan Anak Bangsa';
  const businessUnit = 'Shared Service';

  test('SM-WS-001: Membuat work schedule baru dengan waktu yang belum ada di sistem', async ({ page }) => {
    createdNames.push(name1);
    const workSchedule = new WorkSchedulePage(page);

    await workSchedule.openCreate();
    await workSchedule.fillName(name1);
    await workSchedule.selectCompany(company);
    await workSchedule.selectBusinessUnit(businessUnit);
    await workSchedule.setAllTimes(uniqueTimes);
    await workSchedule.setEffectiveDateToday();
    await workSchedule.clickCreate();

    await workSchedule.expectSuccessToast();
    await workSchedule.gotoList();
    await workSchedule.searchByName(name1);
    await workSchedule.expectRowVisible(name1);
  });

  test('SM-WS-002: Membuat work schedule dengan mandatory field kosong (negatif)', async ({ page }) => {
    const workSchedule = new WorkSchedulePage(page);

    await workSchedule.openCreate();
    await workSchedule.clickCreateExpectError();

    await workSchedule.expectFieldError('Name is required');
  });

  test('SM-WS-003: Membuat work schedule dengan kombinasi yang sama dengan yang sudah terdaftar (negatif)', async ({ page }) => {
    const dupName = `WS_Dup_${suffix}`;
    const dupName2 = `WS_Dup2_${suffix}`;
    createdNames.push(dupName, dupName2);
    const workSchedule = new WorkSchedulePage(page);

    // Buat schedule pertama
    await workSchedule.openCreate();
    await workSchedule.fillName(dupName);
    await workSchedule.selectCompany(company);
    await workSchedule.selectBusinessUnit(businessUnit);
    await workSchedule.setAllTimes(uniqueTimes);
    await workSchedule.setEffectiveDateToday();
    await workSchedule.clickCreate();
    await workSchedule.expectSuccessToast();

    // Buat lagi dengan kombinasi waktu/scope yang sama
    await workSchedule.openCreate();
    await workSchedule.fillName(dupName2);
    await workSchedule.selectCompany(company);
    await workSchedule.selectBusinessUnit(businessUnit);
    await workSchedule.setAllTimes(uniqueTimes);
    await workSchedule.setEffectiveDateToday();
    await workSchedule.clickCreateExpectError();

    await workSchedule.expectFieldError(/already|exist|duplicate|same|sudah|sama|conflict/i);
  });

  test('SM-WS-004: Mengedit work schedule yang sudah ada di sistem', async ({ page }) => {
    createdNames.push(name1, editedName);
    const workSchedule = new WorkSchedulePage(page);

    await workSchedule.openCreate();
    await workSchedule.fillName(name1);
    await workSchedule.selectCompany(company);
    await workSchedule.selectBusinessUnit(businessUnit);
    await workSchedule.setAllTimes(uniqueTimes);
    await workSchedule.setEffectiveDateToday();
    await workSchedule.clickCreate();
    await workSchedule.expectSuccessToast();

    await workSchedule.gotoList();
    await workSchedule.searchByName(name1);
    await workSchedule.openEdit(name1);
    await workSchedule.fillName(editedName);
    await workSchedule.clickSave();

    await workSchedule.expectSuccessToast();
    await workSchedule.gotoList();
    await workSchedule.searchByName(editedName);
    await workSchedule.expectRowVisible(editedName);
  });

  test('SM-WS-005: Mengedit work schedule dengan mandatory field kosong (negatif)', async ({ page }) => {
    createdNames.push(name1);
    const workSchedule = new WorkSchedulePage(page);

    await workSchedule.openCreate();
    await workSchedule.fillName(name1);
    await workSchedule.selectCompany(company);
    await workSchedule.selectBusinessUnit(businessUnit);
    await workSchedule.setAllTimes(uniqueTimes);
    await workSchedule.setEffectiveDateToday();
    await workSchedule.clickCreate();
    await workSchedule.expectSuccessToast();

    await workSchedule.gotoList();
    await workSchedule.searchByName(name1);
    await workSchedule.openEdit(name1);
    await workSchedule.fillName('');
    await workSchedule.clickSave();

    await workSchedule.expectFieldError('Name is required');
  });

  test('SM-WS-006: Menonaktifkan work schedule yang sudah ada di sistem', async ({ page }) => {
    createdNames.push(name1);
    const workSchedule = new WorkSchedulePage(page);

    await workSchedule.openCreate();
    await workSchedule.fillName(name1);
    await workSchedule.selectCompany(company);
    await workSchedule.selectBusinessUnit(businessUnit);
    await workSchedule.setAllTimes(uniqueTimes);
    await workSchedule.setEffectiveDateToday();
    await workSchedule.clickCreate();
    await workSchedule.expectSuccessToast();

    // Edit status menjadi Inactive
    await workSchedule.gotoList();
    await workSchedule.searchByName(name1);
    await workSchedule.openEdit(name1);
    await workSchedule.setStatus('Inactive');
    await workSchedule.clickSave();
    await workSchedule.expectSuccessToast();

    await workSchedule.gotoList();
    await workSchedule.searchByName(name1);
    await workSchedule.expectRowVisible(name1);
    await workSchedule.expectRowContainsText(name1, /inactive/i);
  });

  test('SM-WS-007: Melihat seluruh work schedule yang sudah ada di sistem', async ({ page }) => {
    createdNames.push(name1);
    const workSchedule = new WorkSchedulePage(page);

    // Prasyarat: satu schedule agar filter bisa diverifikasi
    await workSchedule.openCreate();
    await workSchedule.fillName(name1);
    await workSchedule.selectCompany(company);
    await workSchedule.selectBusinessUnit(businessUnit);
    await workSchedule.setAllTimes(uniqueTimes);
    await workSchedule.setEffectiveDateToday();
    await workSchedule.clickCreate();
    await workSchedule.expectSuccessToast();

    // Verifikasi kolom tabel
    await workSchedule.gotoList();
    await workSchedule.expectColumns([
      'Name',
      'Day',
      'Working Hours',
      'Break Hours',
      'Company',
      'Business Unit',
      'Job Position',
      'Status',
      'Action',
    ]);

    // Filter "Search by name"
    await workSchedule.searchByName(name1);
    await workSchedule.expectRowVisible(name1);

    await workSchedule.searchByName(`no_match_${suffix}`);
    await workSchedule.expectRowHidden(name1);
  });

  test.afterEach(async ({ playwright }, testInfo) => {
    if (!createdNames.length) return;

    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext: APIRequestContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });

    await deleteSchedulesByNames(apiContext, createdNames.splice(0), testInfo);

    await apiContext.dispose();
  });
});
