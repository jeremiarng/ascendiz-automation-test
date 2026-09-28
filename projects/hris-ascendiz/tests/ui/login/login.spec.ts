import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test, expect } from '@shared/fixtures/ui.fixture';
import { LoginPage, DashboardPage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Login - Positive Cases', { tag: ['@smoke', '@ui'] }, () => {
  test('P0: Login via saved storage state and verify dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto('/');
    await dashboard.expectDashboardVisible();
  });

  test('P0: Navigate to Attendance List via Attendance menu', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto('/');
    await dashboard.expectDashboardVisible();
    await dashboard.navigateTo('Attendance Management');
    await page.getByRole('link', { name: 'View Attendance' }).click();
    await expect(page.getByRole('heading', { name: 'Attendance List' })).toBeVisible();
    await expect(page).toHaveURL(/\/attendance\/list/);
  });
});

test.describe('Login - Negative Cases', { tag: ['@ui'] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('P1: Invalid password shows error and stays on login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(
      process.env.ADMIN_EMAIL || '',
      'WrongPassword_123'
    );
    await expect(page.getByText('Your password is incorrect')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter username or email' })).toBeVisible();
  });
});
