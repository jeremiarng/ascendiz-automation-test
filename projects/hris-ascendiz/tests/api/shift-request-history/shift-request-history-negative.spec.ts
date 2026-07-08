import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Shift Request History API Tests - Negative Cases', () => {
  let adminContext: APIRequestContext;
  let employeeContext: APIRequestContext;
  let unauthContext: APIRequestContext;
  test.beforeAll(async ({ playwright, request }) => {
    const adminToken = await getAccessToken(request, process.env.ADMIN_EMAIL as string, process.env.ADMIN_PASSWORD as string);
    // Standard employee with no subordinate access scope
    const employeeToken = await getAccessToken(request, process.env.EMPLOYEE_EMAIL as string, process.env.EMPLOYEE_PASSWORD as string);
    adminContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    });
    employeeContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${employeeToken}`, 'Content-Type': 'application/json' },
    });
    unauthContext = await playwright.request.newContext({
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
  });
  test.afterAll(async () => {
    if (adminContext) await adminContext.dispose();
    if (employeeContext) await employeeContext.dispose();
    if (unauthContext) await unauthContext.dispose();
  });
  test.describe('Authentication & Authorization Issues', () => {
    test('TC-07: GET /v1/shifts/all-transactions - Access All Transactions without Authentication', async ({ }, testInfo) => {
      const api = new ApiFixture(unauthContext, testInfo);

      const { response } = await api.get('/api/v1/shifts/all-transactions', undefined, {
        resTitle: 'Response Body For Unauthenticated Request'
      });
      const status = response.status();
      expect([401, 403].includes(status), `Expected: 401/403, but Received: ${status}`).toBeTruthy();
    });
    test('TC-11: GET /v1/shifts/subordinate-transactions - View Subordinate Requests without Manager Role', async ({ }, testInfo) => {
      const api = new ApiFixture(employeeContext, testInfo);

      const { response, responseBody } = await api.get('/api/v1/shifts/subordinate-transactions', undefined, {
        resTitle: 'Response Body For Unauthorized Subordinate Request'
      });
      const status = response.status();
      // Bisa 403 (Forbidden) atau 200 tetapi dengan array shift_transactions yang kosong karena tidak punya subordinates
      expect([403, 200].includes(status), `Expected: 403/200, but Received: ${status}`).toBeTruthy();

      if (status === 200) {
        const hasEmptyList = Array.isArray(responseBody?.shift_transactions) && responseBody.shift_transactions.length === 0;
        expect(hasEmptyList, 'Expected empty shift_transactions list due to lack of subordinate access scope').toBeTruthy();
      }
    });
  });
  test.describe('Invalid Data & Parameter Validations', () => {
    test('TC-08: GET /v1/shifts/transactions/:id - Get Request Details with non-existent ID', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);

      const { response } = await api.get('/api/v1/shifts/transactions/999999', undefined, {
        resTitle: 'Response Body For Non-Existent Transaction ID'
      });
      const status = response.status();
      expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
    });
    test('TC-09: DELETE /v1/shifts/transactions/:id - Delete Request with non-existent ID', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);

      const { response } = await api.delete('/api/v1/shifts/transactions/999999', {
        resTitle: 'Response Body For Delete Non-Existent Transaction'
      });
      const status = response.status();
      expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
    });
    test('TC-10: GET /v1/shifts/all-transactions - Filter Request History with Invalid Date Logic (Start > End)', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const params = { start_date: '2026-06-30', end_date: '2026-06-01' };

      const { response } = await api.get('/api/v1/shifts/all-transactions', params, {
        paramsTitle: 'Request Params For Invalid Date Range Filter'
      });
      const status = response.status();
      // Berdasarkan TC-10 expect nya Bad Request (400) atau 422 Unprocessable Entity
      expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
    });
  });
});
