import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test } from '@shared/fixtures/ui.fixture';
import { AllShiftRequestHistoryPage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

// =====================================================================
// Module Shift Management — Submodule Shift Request History
// Status mengacu pada docs/ui-flow/Shift Management.md:
//   [In Progress] SM-RH-001 s/d SM-RH-003
// =====================================================================

test.describe('Shift Management - Shift Request History [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  const columns = [
    'ID',
    'Request Date',
    'Request User',
    'Shift Date From',
    'Shift Date To',
    'Type',
    'Total Employee',
    'Start Time',
    'End Time',
    'Status',
    'Action',
  ];

  test('SM-RH-001: Melihat seluruh request shift untuk seluruh employee', async ({ page }) => {
    const requestHistory = new AllShiftRequestHistoryPage(page);

    await requestHistory.goto();
    await requestHistory.usePreviousMonthRange();
    await requestHistory.search();

    await requestHistory.expectColumns(columns);
    await requestHistory.expectHasRows();
  });

  test('SM-RH-002: Melihat request shift dengan date range yang salah (negatif)', async ({ page }) => {
    const requestHistory = new AllShiftRequestHistoryPage(page);

    await requestHistory.goto();
    await requestHistory.useDateRangeYear('2020'); // range yang tidak mungkin ada data
    await requestHistory.search();

    await requestHistory.expectNoRows();
  });

  test('SM-RH-003: Menghapus shift request history', async ({ page }) => {
    const requestHistory = new AllShiftRequestHistoryPage(page);

    await requestHistory.goto();
    await requestHistory.usePreviousMonthRange();
    await requestHistory.search();
    await requestHistory.expectHasRows();

    const deletedId = await requestHistory.deleteFirstRow();
    await requestHistory.expectRowHidden(deletedId);
  });
});
