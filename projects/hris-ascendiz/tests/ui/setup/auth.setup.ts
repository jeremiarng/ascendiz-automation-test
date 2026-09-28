import { test as setup, expect } from '@playwright/test';

const authFile = '.auth/hris-admin.json';

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL/ADMIN_PASSWORD in .env. Login setup cannot run.');
  }

  await page.goto('/login?next=%252F');
  await page.getByRole('textbox', { name: 'Enter username or email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Attendance Management' }).first()).toBeVisible();

  await page.context().storageState({ path: authFile });
});
