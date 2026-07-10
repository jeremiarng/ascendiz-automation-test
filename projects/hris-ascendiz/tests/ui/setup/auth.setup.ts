import { test as setup, expect } from '@playwright/test';

const authFile = '.auth/hris-admin.json';

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL || 'admin.sevenretail@ascendiz.id';
  const password = process.env.ADMIN_PASSWORD || 'S7RaJTbZdM!';

  await page.goto('https://staging.zappy.my.id/login?next=%252F');
  await page.getByRole('textbox', { name: 'Enter username or email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Contract Employees Expiracy' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Employee Performance Summary' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
