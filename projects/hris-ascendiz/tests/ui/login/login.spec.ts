import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test, expect } from '@shared/fixtures/ui.fixture';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test('Login and verify dashboard page', async ({ page }) => {
  await page.goto('https://staging.zappy.my.id/');
  await expect(page.getByRole('heading', { name: 'Contract Employees Expiracy' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Employee Performance Summary' })).toBeVisible();
});

test('Verify attendance list page', async ({ page }) => {
  await page.goto('https://staging.zappy.my.id/attendance/list');
  await expect(page.getByRole('cell', { name: 'Duyi' }).first()).toBeVisible();
});
