import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { buildShiftTransactionPayload, buildShiftTransactionUpdatePayload } from '@hris-ascendiz/factories/shift-request-history.factory';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Shift Request History API Tests - Positive Cases', () => {
  let adminContext: APIRequestContext;
  let managerContext: APIRequestContext;
  let employeeContext: APIRequestContext;
  let masterEmployeeIds: number[] = [Number(process.env.SUBORDINATE_ID)];
  test.beforeAll(async ({ playwright, request }) => {
    const adminToken = await getAccessToken(request, process.env.ADMIN_EMAIL as string, process.env.ADMIN_PASSWORD as string);
    const managerToken = await getAccessToken(request, process.env.MANAGER_EMAIL as string, process.env.MANAGER_PASSWORD as string);
    const employeeToken = await getAccessToken(request, process.env.EMPLOYEE_EMAIL as string, process.env.EMPLOYEE_PASSWORD as string);
    adminContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    });
    managerContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${managerToken}`, 'Content-Type': 'application/json' },
    });
    employeeContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${employeeToken}`, 'Content-Type': 'application/json' },
    });
  });
  test.afterAll(async () => {
    if (adminContext) await adminContext.dispose();
    if (managerContext) await managerContext.dispose();
    if (employeeContext) await employeeContext.dispose();
  });
  test.describe('Read Operations (TC-01, TC-02, TC-03)', () => {
    test('TC-01: GET /v1/shifts/all-transactions - View Shift Request History for All Employees (Admin)', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const params = { limit: 10, offset: 0 };

      const { response, responseBody } = await api.get('/api/v1/shifts/all-transactions', params, {
        paramsTitle: 'Request Params For View All Shift History'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(Array.isArray(responseBody?.shift_transactions), 'Expected shift_transactions to be an array').toBeTruthy();
    });
    test('TC-02: GET /v1/shifts/subordinate-transactions - View Subordinate Shift Requests (Manager)', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const params = { limit: 10, offset: 0 };

      const { response, responseBody } = await api.get('/api/v1/shifts/subordinate-transactions', params, {
        paramsTitle: 'Request Params For Subordinate Shift History'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(Array.isArray(responseBody?.shift_transactions), 'Expected shift_transactions to be an array').toBeTruthy();
    });
    test('TC-02: GET /v1/shifts/transactions/me - View My Shift Request History (Employee)', async ({ }, testInfo) => {
      const api = new ApiFixture(employeeContext, testInfo);
      const params = { limit: 10, offset: 0 };

      const { response, responseBody } = await api.get('/api/v1/shifts/transactions/me', params, {
        paramsTitle: 'Request Params For My Shift History'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(Array.isArray(responseBody?.shift_transactions), 'Expected shift_transactions to be an array').toBeTruthy();
    });
    test('TC-03: GET /v1/shifts/all-transactions - Filter Request History by Date (Admin)', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const startDate = '2026-06-01';
      const endDate = '2026-06-30';
      const params = { start_date: startDate, end_date: endDate };

      const { response, responseBody } = await api.get('/api/v1/shifts/all-transactions', params, {
        paramsTitle: 'Request Params For Date Filtered History'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();

      if (responseBody?.shift_transactions && responseBody.shift_transactions.length > 0) {
        for (const trx of responseBody.shift_transactions) {
          const trxDate = trx.start_date;
          expect(
            trxDate >= startDate && trxDate <= endDate,
            `Expected start_date ${trxDate} to be within range ${startDate} - ${endDate}`
          ).toBeTruthy();
        }
      }
    });
  });
  test.describe('Mutation and Details Lifecycle (TC-04, TC-05, TC-06)', () => {
    let transactionId: number;
    let scheduleIds: number[] = [];

    // Fallback cleanup if test fails in the middle of lifecycle
    test.afterAll(async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      for (const scheduleId of scheduleIds) {
        await api.delete(`/api/v1/shifts/schedules/${scheduleId}`, {
          resTitle: 'Fallback Cleanup: Delete Schedule'
        });
      }
      if (transactionId) {
        await api.delete(`/api/v1/shifts/transactions/${transactionId}`, {
          resTitle: 'Fallback Cleanup: Delete Shift Transaction'
        });
      }
    });
    test.beforeAll(async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const payload = buildShiftTransactionPayload(masterEmployeeIds);

      const { response, responseBody } = await api.post('/api/v1/shifts/transactions', payload, {
        reqTitle: 'Request Body For Create Dummy Transaction'
      });

      const status = response.status();
      expect([200, 201].includes(status), `Expected: 200/201, but Received: ${status}`).toBeTruthy();

      const trx = responseBody?.data?.transactions?.[0];
      transactionId = trx?.transaction_id;
      scheduleIds = trx?.schedule_ids || [];
      expect(!!transactionId, 'Failed to get transaction ID from creation response').toBeTruthy();
    });
    test('TC-04: GET /v1/shifts/transactions/:id - View Request Details by ID', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);

      const { response, responseBody } = await api.get(`/api/v1/shifts/transactions/${transactionId}`, undefined, {
        resTitle: 'Response Body For Request Details'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(responseBody?.shift_transaction?.id).toBe(transactionId);
    });
    test('TC-05: PATCH /v1/shifts/transactions/:id - Update Shift Request Transaction', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const updatePayload = buildShiftTransactionUpdatePayload({ id: transactionId, start_time: '10:00' });

      const { response, responseBody } = await api.patch(`/api/v1/shifts/transactions/${transactionId}`, updatePayload, {
        reqTitle: 'Request Body For Update Transaction'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();

      // Validasi response body jika API mengembalikan data yang diupdate
      if (responseBody?.shift_transaction) {
        expect(responseBody.shift_transaction.start_time || updatePayload.start_time).toBe(updatePayload.start_time);
      }
    });
    test('TC-06: DELETE /v1/shifts/transactions/:id - Delete Request History', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);

      for (const scheduleId of scheduleIds) {
        await api.delete(`/api/v1/shifts/schedules/${scheduleId}`, {
          resTitle: 'Response Body For Delete Schedule'
        });
      }

      const { response } = await api.delete(`/api/v1/shifts/transactions/${transactionId}`, {
        resTitle: 'Response Body For Delete Transaction'
      });

      const status = response.status();
      expect([200, 204].includes(status), `Expected: 200/204, but Received: ${status}`).toBeTruthy();

      // Clear IDs to prevent double deletion in afterAll
      transactionId = 0;
      scheduleIds = [];
    });
  });
});
