import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

test.describe('Dashboard', { tag: ['@smoke', '@ui'] }, () => {
  test('should display dashboard after login', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.heading).toBeVisible({ timeout: 10000 });
  });

  test('should have visible sidebar navigation', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.sidebar).toBeVisible({ timeout: 10000 });
  });
});
