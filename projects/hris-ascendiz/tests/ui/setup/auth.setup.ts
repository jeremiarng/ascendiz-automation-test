import { test as setup, expect } from '@playwright/test';

const authFile = '.auth/hris-admin.json';

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL || 'admin.sevenretail@ascendiz.id';
  const password = process.env.ADMIN_PASSWORD || 'S7RaJTbZdM!';

  await page.goto('/login');
  await page.fill('[type="email"]', email);
  await page.fill('[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  await page.context().storageState({ path: authFile });
});
