import { test, expect } from '@shared/fixtures/ui.fixture';

test('test', async ({ page }) => {
  await page.goto('https://staging.zappy.my.id/');
  await expect(page.getByRole('heading', { name: 'Contract Employees Expiracy' })).toBeVisible();
  await page.getByRole('link', { name: 'Shift Management' }).click();
  await page.getByRole('link', { name: 'Shift Template' }).click();
  await page.getByRole('button', { name: 'Add Shift Template' }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('testing extension2');
  await page.getByRole('checkbox', { name: 'Required Clock In/Out' }).check();
  await page.locator('div').filter({ hasText: /^Start Time\*End Time\*Is Next DayYesNo$/ }).getByPlaceholder('09:').click();
  await page.locator('div').filter({ hasText: /^Start Time\*End Time\*Is Next DayYesNo$/ }).getByPlaceholder('09:').fill('09:00');
  await page.locator('div').filter({ hasText: /^Start Time\*End Time\*Is Next DayYesNo$/ }).getByPlaceholder('17:').click();
  await page.locator('div').filter({ hasText: /^Start Time\*End Time\*Is Next DayYesNo$/ }).getByPlaceholder('17:').fill('12:00');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('cell', { name: 'testing extension2' })).toBeVisible();
});