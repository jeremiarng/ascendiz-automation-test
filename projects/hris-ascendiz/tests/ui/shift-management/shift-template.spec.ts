import { APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test } from '@shared/fixtures/ui.fixture';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';
import { ApiFixture } from '@shared/fixtures/api.fixture';
import { ShiftTemplatePage, AllShiftSchedulePage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

/**
 * Cari shift template berdasarkan nama via API, lalu hapus.
 */
async function deleteTemplatesByNames(
  request: APIRequestContext,
  names: string[],
  testInfo: import('@playwright/test').TestInfo,
): Promise<void> {
  const api = new ApiFixture(request, testInfo);
  const { responseBody } = await api.get(ENDPOINTS.SHIFT_TEMPLATES.BASE, { limit: 500 }, {
    resTitle: 'Cleanup: List Shift Templates',
  });
  const shifts = responseBody?.shifts || [];
  for (const name of names) {
    const match = shifts.find((s: any) => s.name === name);
    if (match) {
      await api.delete(ENDPOINTS.SHIFT_TEMPLATES.BY_ID(match.id), { resTitle: `Cleanup: Delete Shift Template ${name}` });
    }
  }
}

// =====================================================================
// Module Shift Management — Submodule Shift Template
// Status mengacu pada docs/ui-flow/Shift Management.md:
//   [In Progress] SM-ST-001 s/d SM-ST-005
// =====================================================================

test.describe('Shift Management - Shift Template [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  const suffix = faker.string.alphanumeric(6);
  const createdName = `SM_Create_${suffix}`;
  const deleteName = `SM_Delete_${suffix}`;
  const editName = `SM_Edit_${suffix}`;
  const editedName = `SM_Edited_${suffix}`;
  const inactiveName = `SM_Inactive_${suffix}`;
  const defaultName = `SM_Default_${suffix}`;

  test('SM-ST-001: Membuat shift template baru dengan valid value', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: createdName,
      requiredClockInOut: true,
      startTime: '09:00',
      endTime: '17:00',
    });
    await shiftTemplate.clickCreate();

    // Data baru muncul di Shift Template List
    await shiftTemplate.searchTemplate(createdName);
    await shiftTemplate.expectRowVisible(createdName);
    await shiftTemplate.expectRowContainsText(createdName, createdName);
  });

  test('SM-ST-002: Membuat shift template baru dengan beberapa field mandatory kosong', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();

    // Kosongkan field mandatory (name)
    await shiftTemplate.clickCreateExpectError();

    await shiftTemplate.expectFieldError('Name is required');
  });

  test('SM-ST-003: Membuat shift template dengan start time lebih besar dari end time', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: `SM_StartGtEnd_${suffix}`,
      requiredClockInOut: true,
      startTime: '18:00',
      endTime: '09:00',
    });
    await shiftTemplate.clickCreateExpectError();

    await shiftTemplate.expectFieldError('Start Time must be less than End Time');
  });

  test('SM-ST-004: Membuat shift template dengan break time di luar range jam kerja', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: `SM_BreakOut_${suffix}`,
      requiredClockInOut: true,
      requiredBreak: true,
      startTime: '09:00',
      endTime: '17:00',
      breakStartTime: '07:00',
      breakEndTime: '18:00',
    });
    await shiftTemplate.clickCreateExpectError();

    await shiftTemplate.expectFieldError('Break In time cannot be earlier than Clock In time');
  });

  test('SM-ST-005: Membuat shift template dengan break time sama dengan jam kerja', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: `SM_BreakSame_${suffix}`,
      requiredClockInOut: true,
      requiredBreak: true,
      startTime: '09:00',
      endTime: '17:00',
      breakStartTime: '09:00',
      breakEndTime: '17:00',
    });
    await shiftTemplate.clickCreateExpectError();

    await shiftTemplate.expectFieldError('Clock In time cannot be the same as Break In time');
  });

  test('SM-ST-006: Menghapus shift template yang sudah ada di sistem', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: deleteName,
      requiredClockInOut: true,
      startTime: '09:00',
      endTime: '17:00',
    });
    await shiftTemplate.clickCreate();

    // Cari row yang baru dibuat lalu hapus
    await shiftTemplate.searchTemplate(deleteName);
    await shiftTemplate.expectRowVisible(deleteName);
    await shiftTemplate.clickDelete(deleteName);
    await shiftTemplate.confirmDelete();

    await shiftTemplate.expectRowHidden(deleteName);
  });

  test('SM-ST-007: Melakukan edit pada shift template yang sudah ada di sistem', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: editName,
      requiredClockInOut: true,
      startTime: '09:00',
      endTime: '17:00',
    });
    await shiftTemplate.clickCreate();

    // Edit nama shift template
    await shiftTemplate.searchTemplate(editName);
    await shiftTemplate.expectRowVisible(editName);
    await shiftTemplate.openEditModal(editName);
    await shiftTemplate.fillTemplateName(editedName);
    await shiftTemplate.clickSave();

    await shiftTemplate.searchTemplate(editedName);
    await shiftTemplate.expectRowVisible(editedName);
    await shiftTemplate.expectRowContainsText(editedName, editedName);
  });

  test('SM-ST-008: Menonaktifkan shift template yang sudah ada di sistem', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: inactiveName,
      requiredClockInOut: true,
      startTime: '09:00',
      endTime: '17:00',
    });
    await shiftTemplate.clickCreate();

    // Set status menjadi Inactive
    await shiftTemplate.searchTemplate(inactiveName);
    await shiftTemplate.expectRowVisible(inactiveName);
    await shiftTemplate.openEditModal(inactiveName);
    await shiftTemplate.setStatus('Inactive');
    await shiftTemplate.clickSave();

    await shiftTemplate.searchTemplate(inactiveName);
    await shiftTemplate.expectRowVisible(inactiveName);
    await shiftTemplate.expectRowContainsText(inactiveName, 'Inactive');

    // Shift template non-aktif tidak boleh muncul di dropdown Create Work Schedule
    const allShiftSchedule = new AllShiftSchedulePage(page);
    await allShiftSchedule.goto();
    await allShiftSchedule.openCreateModal();
    await allShiftSchedule.selectScheduleType('Shift Template');
    await allShiftSchedule.expectShiftTemplateOptionAbsent(inactiveName);
  });

  test('SM-ST-009: Membuat shift template baru dengan pengaturan default', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.openCreateModal();
    await shiftTemplate.fillCreateForm({
      name: defaultName,
      requiredClockInOut: true,
      startTime: '09:00',
      endTime: '17:00',
      isDefault: true,
    });
    await shiftTemplate.clickCreate();

    // Shift template default tidak dapat dihapus → tombol delete hilang
    await shiftTemplate.searchTemplate(defaultName);
    await shiftTemplate.expectRowVisible(defaultName);
    await shiftTemplate.expectDeleteButtonHidden(defaultName);
  });

  test('SM-ST-010: Melihat seluruh shift template yang telah dibuat di sistem', async ({ page }) => {
    const shiftTemplate = new ShiftTemplatePage(page);

    await shiftTemplate.gotoList();
    await shiftTemplate.expectColumns([
      'No',
      'Name',
      'Company',
      'Business Unit',
      'Working Hours',
      'Break Hours',
      'Status',
      'Action',
    ]);
  });

  // Cleanup: hapus semua shift template yang dibuat (positif maupun sisa partial)
  test.afterAll(async ({ playwright }, testInfo) => {
    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });

    await deleteTemplatesByNames(
      apiContext,
      [
        createdName,
        `SM_StartGtEnd_${suffix}`,
        `SM_BreakOut_${suffix}`,
        `SM_BreakSame_${suffix}`,
        deleteName,
        editName,
        editedName,
        inactiveName,
        defaultName,
      ],
      testInfo,
    );

    await apiContext.dispose();
  });
});
