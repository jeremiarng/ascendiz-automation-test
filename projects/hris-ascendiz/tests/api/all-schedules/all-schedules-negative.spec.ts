import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { buildTransactionPayload, buildScheduleUpdatePayload } from '@hris-ascendiz/factories/all-schedules.factory';
import { ApiFixture } from '@shared/fixtures/api.fixture';
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('All Schedules API Tests - Negative Cases', () => {
  let adminContext: APIRequestContext;
  let managerContext: APIRequestContext;
  let unauthContext: APIRequestContext;
  let masterEmployeeIds: number[] = [Number(process.env.SUBORDINATE_ID)];

  test.beforeAll(async ({ playwright, request }) => {
    const adminToken = await getAccessToken(request, process.env.ADMIN_EMAIL as string, process.env.ADMIN_PASSWORD as string);
    const managerToken = await getAccessToken(request, process.env.MANAGER_EMAIL as string, process.env.MANAGER_PASSWORD as string);

    adminContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    });
    managerContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${managerToken}`, 'Content-Type': 'application/json' },
    });
    unauthContext = await playwright.request.newContext({
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
  });

  test.afterAll(async () => {
    if (adminContext) await adminContext.dispose();
    if (managerContext) await managerContext.dispose();
    if (unauthContext) await unauthContext.dispose();
  });

  test.describe('Invalid Create Schedule Transactions', () => {
    test('TC-13: POST /v1/shifts/transactions - Create Shift Transaction with empty employees', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const payload = buildTransactionPayload(masterEmployeeIds, {
        schedule_type: 'manual',
        shift_type: 'off',
        start_date: '2026-07-03',
        end_date: '2026-07-03',
        schedule_date: '2026-07-03',
        shifts: [],
        start_time: '',
        end_time: '',
        break_start_time: '',
        break_end_time: '',
        employee_ids: []
      });

      const { response } = await api.post(ENDPOINTS.SHIFTS.TRANSACTIONS, payload, {
        reqTitle: 'Request Body For Empty Employees'
      });

      const status = response.status();
      expect([400, 422, 404].includes(status), `Expected: 400/422 or 404 (Not Best Practice), but Received: ${status}`).toBeTruthy();
    });
  });

  test.describe('Invalid Read Schedules', () => {
    test('TC-14: GET /v1/shifts/schedules/:id - Get Schedule with non-existent ID', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const { response } = await api.get(ENDPOINTS.SHIFTS.SCHEDULE_BY_ID(999999), undefined, {
        resTitle: 'Response Body For Non-Existent ID'
      });

      const status = response.status();
      expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
    });

    test('TC-15: GET /v1/shifts/schedules - View Schedule without Authentication', async ({ }, testInfo) => {
      const api = new ApiFixture(unauthContext, testInfo);
      const { response } = await api.get(ENDPOINTS.SHIFTS.SCHEDULES, undefined, {
        resTitle: 'Response Body For Unauthenticated Request'
      });

      const status = response.status();
      expect([401, 403].includes(status), `Expected: 401/403, but Received: ${status}`).toBeTruthy();
    });

    test('TC-16: GET /v1/shifts/schedules - View Calendar with invalid date logical order', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const params = { start_date: '2026-06-30', end_date: '2026-06-01' };

      const { response } = await api.get(ENDPOINTS.SHIFTS.SCHEDULES, params, {
        paramsTitle: 'Request Params For Invalid Date Order'
      });

      const status = response.status();
      expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
    });
  });

  test.describe('Invalid Update and Delete Schedules', () => {
    test('TC-17: PATCH /v1/shifts/schedules/:id - Update Schedule with non-existent ID', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const updatePayload = buildScheduleUpdatePayload({
        id: 999999,
        start_time: '09:00',
        end_time: '18:00',
      });

      const { response } = await api.patch(ENDPOINTS.SHIFTS.SCHEDULE_BY_ID(999999), updatePayload, {
        reqTitle: 'Request Body For Update Non-Existent ID'
      });

      const status = response.status();
      expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
    });

    test('TC-18: PATCH /v1/shifts/schedules/:id - Update Schedule without Authentication', async ({ }, testInfo) => {
      const api = new ApiFixture(unauthContext, testInfo);
      const updatePayload = buildScheduleUpdatePayload({
        id: 1, // dummy id
        start_time: '09:00',
        end_time: '18:00',
      });

      const { response } = await api.patch(ENDPOINTS.SHIFTS.SCHEDULE_BY_ID(1), updatePayload, {
        reqTitle: 'Request Body For Update Unauthenticated Request'
      });

      const status = response.status();
      expect([401, 403].includes(status), `Expected: 401/403, but Received: ${status}`).toBeTruthy();
    });

    test('TC-19: DELETE /v1/shifts/schedules/:id - Delete Schedule with non-existent ID', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const { response } = await api.delete(ENDPOINTS.SHIFTS.SCHEDULE_BY_ID(999999), {
        resTitle: 'Response Body For Delete Non-Existent ID'
      });

      const status = response.status();
      expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
    });

    test('TC-20: DELETE /v1/shifts/schedules/:id - Delete Schedule without Authentication', async ({ }, testInfo) => {
      const api = new ApiFixture(unauthContext, testInfo);
      const { response } = await api.delete(ENDPOINTS.SHIFTS.SCHEDULE_BY_ID(1), {
        resTitle: 'Response Body For Delete Unauthenticated Request'
      });

      const status = response.status();
      expect([401, 403].includes(status), `Expected: 401/403, but Received: ${status}`).toBeTruthy();
    });
  });
});
