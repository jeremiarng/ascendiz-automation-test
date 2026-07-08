import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../pages';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Login', { tag: ['@smoke', '@ui'] }, () => {
  test('should login with valid admin credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.ADMIN_EMAIL || 'admin.sevenretail@ascendiz.id',
      process.env.ADMIN_PASSWORD || 'S7RaJTbZdM!',
    );

    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible({ timeout: 10000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@email.com', 'wrongpassword');

    const errorLocator = page.locator('[class*="error"], [class*="alert"], [role="alert"]');
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
  });
});
