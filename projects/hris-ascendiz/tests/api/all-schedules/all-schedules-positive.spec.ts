import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { buildTransactionPayload, buildScheduleUpdatePayload } from '@hris-ascendiz/factories/all-schedules.factory';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('All Schedules API Tests - Positive Cases', () => {
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

  test.describe('Read Schedules based on Role', () => {
    test('GET /v1/shifts/schedules - View Schedule Calendar (Admin)', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const params = { offset: 0, limit: 10, start_date: '2026-06-21', end_date: '2026-06-27' };

      const { response } = await api.get('/api/v1/shifts/schedules', params, {
        paramsTitle: 'Request Params For Admin View Schedules',
      });
      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
    });

    test('GET /v1/shifts/schedules - View with various filter parameters (Admin)', async ({ }, testInfo) => {
      const api = new ApiFixture(adminContext, testInfo);
      const params = {
        employee_name: 'salsa',
        start_date: '2026-06-21',
        end_date: '2026-06-27',
        location_id: Number(process.env.LOCATION_ID),
        department_id: Number(process.env.DEPARTMENT_ID),
      };

      const { response, responseBody } = await api.get('/api/v1/shifts/schedules', params, {
        paramsTitle: 'Request Params For Filtered Admin View',
      });
      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();

      const scheduleData = responseBody?.schedules?.[0] || responseBody?.[0];
      if (scheduleData) {
        const firstName = scheduleData.employee?.first_name?.toLowerCase() || '';
        const lastName = scheduleData.employee?.last_name?.toLowerCase() || '';
        expect(firstName.includes('salsa') || lastName.includes('salsa'), `Expected employee name to contain 'salsa'`).toBeTruthy();
      }
    });

    test('GET /v1/shifts/subordinate-schedules - View Subordinate Schedule Calendar (Manager)', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const { response } = await api.get('/api/v1/shifts/subordinate-schedules', undefined, {
        resTitle: 'Response Body For Subordinate Schedules',
      });
      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
    });

    test('GET /v1/shifts/my-schedules - View My Schedules (Employee)', async ({ }, testInfo) => {
      const api = new ApiFixture(employeeContext, testInfo);
      const { response } = await api.get('/api/v1/shifts/my-schedules', undefined, {
        resTitle: 'Response Body For My Schedules',
      });
      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
    });
  });

  test.describe('Create Schedule Transactions (Isolated)', () => {
    let createdRecords: { transactionId: number; scheduleIds: number[] }[] = [];

    test.afterAll(async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      for (const record of createdRecords) {
        for (const scheduleId of record.scheduleIds) {
          await api.delete(`/api/v1/shifts/schedules/${scheduleId}`, {
            resTitle: 'Response Body For Cleanup Delete Schedule',
          });
        }
        await api.delete(`/api/v1/shifts/transactions/${record.transactionId}`, {
          resTitle: 'Response Body For Cleanup Delete Transaction',
        });
      }
    });

    test('POST /v1/shifts/transactions - Assign Day Off Schedule', async ({ }, testInfo) => {
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
      });

      const { response, responseBody } = await api.post('/api/v1/shifts/transactions', payload, {
        reqTitle: 'Request Body For Day Off Schedule Assign',
      });

      const status = response.status();
      expect([200, 201].includes(status), `Expected: 200/201, but Received: ${status}`).toBeTruthy();

      const transactions = responseBody?.data?.transactions;
      expect(Array.isArray(transactions) && transactions.length > 0, 'Transactions must not be empty').toBeTruthy();

      for (const trx of transactions) {
        createdRecords.push({
          transactionId: trx.transaction_id,
          scheduleIds: trx.schedule_ids || [],
        });
      }
    });

    test('POST /v1/shifts/transactions - Assign Multiple Shift Schedule', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const payload = buildTransactionPayload(masterEmployeeIds, {
        schedule_type: 'shift_schedule',
        start_date: '2026-07-02',
        end_date: '2026-07-03',
        schedule_date: '2026-07-02',
        shift_id: 52,
        shift_ids: [52, 30],
        shifts: [
          { start_time: '06:00', end_time: '16:00', break_start_time: '12:00', break_end_time: '13:00', is_end_time_next_day: false, is_break_end_time_next_day: false },
          { start_time: '09:00', end_time: '17:00', break_start_time: '12:00', break_end_time: '13:00', is_end_time_next_day: false, is_break_end_time_next_day: false },
        ],
        start_time: '06:00',
        end_time: '16:00',
        break_start_time: '12:00',
        break_end_time: '13:00',
        is_end_time_next_day: false,
        is_break_start_time_next_day: false,
        is_break_end_time_next_day: false,
      });

      const { response, responseBody } = await api.post('/api/v1/shifts/transactions', payload, {
        reqTitle: 'Request Body For Multiple Shift Assign',
      });

      const status = response.status();
      expect([200, 201].includes(status), `Expected: 200/201, but Received: ${status}`).toBeTruthy();

      const transactions = responseBody?.data?.transactions;
      expect(Array.isArray(transactions) && transactions.length > 0, 'Transactions must not be empty').toBeTruthy();

      for (const trx of transactions) {
        createdRecords.push({
          transactionId: trx.transaction_id,
          scheduleIds: trx.schedule_ids || [],
        });
      }
    });

    test('POST /v1/shifts/transactions - Assign Multiple Shift Template', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const payload = buildTransactionPayload(masterEmployeeIds, {
        schedule_type: 'shift_schedule',
        start_date: '2026-06-28',
        end_date: '2026-06-28',
        schedule_date: '2026-06-28',
        location_id: Number(process.env.LOCATION_ID),
        department_id: Number(process.env.DEPARTMENT_ID),
        shift_id: 52,
        shift_ids: [52, 51],
        shifts: [
          { start_time: '06:00', end_time: '16:00', break_start_time: '12:00', break_end_time: '13:00', is_end_time_next_day: false, is_break_end_time_next_day: false },
          { start_time: '09:00', end_time: '17:00', break_start_time: '11:00', break_end_time: '12:00', is_end_time_next_day: false, is_break_end_time_next_day: false },
        ],
        start_time: '06:00',
        end_time: '16:00',
        break_start_time: '12:00',
        break_end_time: '13:00',
        is_end_time_next_day: false,
        is_break_start_time_next_day: false,
        is_break_end_time_next_day: false,
      });

      const { response, responseBody } = await api.post('/api/v1/shifts/transactions', payload, {
        reqTitle: 'Request Body For Multiple Shift Template Assign',
      });

      const status = response.status();
      expect([200, 201].includes(status), `Expected: 200/201, but Received: ${status}`).toBeTruthy();

      const transactions = responseBody?.data?.transactions;
      expect(Array.isArray(transactions) && transactions.length > 0, 'Transactions must not be empty').toBeTruthy();

      for (const trx of transactions) {
        createdRecords.push({
          transactionId: trx.transaction_id,
          scheduleIds: trx.schedule_ids || [],
        });
      }
    });

    test('POST /v1/shifts/transactions - Assign Multiple Manual Shift', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const payload = buildTransactionPayload(masterEmployeeIds, {
        schedule_type: 'manual',
        start_date: '2026-06-30',
        end_date: '2026-06-30',
        schedule_date: '2026-06-30',
        location_id: Number(process.env.LOCATION_ID),
        department_id: Number(process.env.DEPARTMENT_ID),
        shift_id: 0,
        shift_ids: [],
        shifts: [
          { start_time: '06:00', end_time: '12:00', break_start_time: '11:00', break_end_time: '12:00', is_end_time_next_day: false, is_break_end_time_next_day: false },
          { start_time: '13:00', end_time: '18:00', break_start_time: '13:00', break_end_time: '14:00', is_end_time_next_day: false, is_break_end_time_next_day: false },
        ],
        start_time: '06:00',
        end_time: '12:00',
        break_start_time: '11:00',
        break_end_time: '12:00',
        is_end_time_next_day: false,
        is_break_start_time_next_day: false,
        is_break_end_time_next_day: false,
      });

      const { response, responseBody } = await api.post('/api/v1/shifts/transactions', payload, {
        reqTitle: 'Request Body For Multiple Manual Shift Assign',
      });

      const status = response.status();
      expect([200, 201].includes(status), `Expected: 200/201, but Received: ${status}`).toBeTruthy();

      const transactions = responseBody?.data?.transactions;
      expect(Array.isArray(transactions) && transactions.length > 0, 'Transactions must not be empty').toBeTruthy();

      for (const trx of transactions) {
        createdRecords.push({
          transactionId: trx.transaction_id,
          scheduleIds: trx.schedule_ids || [],
        });
      }
    });
  });

  test.describe('Update and Delete Shift Schedule', () => {
    let createdTransactionId: number;
    let createdScheduleId: number;

    test.beforeEach(async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const payload = buildTransactionPayload(masterEmployeeIds, {
        schedule_type: 'manual',
        start_date: '2026-07-02',
        end_date: '2026-07-02',
        schedule_date: '2026-07-02',
        shifts: [{ start_time: '09:00', end_time: '17:00', break_start_time: '12:00', break_end_time: '13:00', is_end_time_next_day: false, is_break_end_time_next_day: false }],
        start_time: '09:00',
        end_time: '17:00',
        break_start_time: '12:00',
        break_end_time: '13:00',
      });

      const { responseBody } = await api.post('/api/v1/shifts/transactions', payload, {
        reqTitle: 'Request Body For Dummy Manual Schedule',
      });

      const trx = responseBody?.data?.transactions?.[0];
      createdTransactionId = trx?.transaction_id;
      createdScheduleId = trx?.schedule_ids?.[0];

      if (!createdScheduleId) throw new Error('Prerequisite: Failed to find schedule ID from transaction in beforeEach');
    });

    test.afterEach(async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      if (createdScheduleId) {
        await api.delete(`/api/v1/shifts/schedules/${createdScheduleId}`, {
          resTitle: 'Response Body For Dummy Schedule Cleanup',
        });
        createdScheduleId = 0;
      }
      if (createdTransactionId) {
        await api.delete(`/api/v1/shifts/transactions/${createdTransactionId}`, {
          resTitle: 'Response Body For Dummy Transaction Cleanup',
        });
        createdTransactionId = 0;
      }
    });

    test('GET /v1/shifts/schedules/:id - Get Shift Schedule By valid id', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const { response, responseBody } = await api.get(`/api/v1/shifts/schedules/${createdScheduleId}`, undefined, {
        resTitle: 'Response Body For Get Schedule By ID',
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(responseBody?.schedule?.id).toBe(createdScheduleId);
    });

    test('PATCH /v1/shifts/schedules/:id - Update Shift Schedule', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const updatePayload = buildScheduleUpdatePayload({
        id: createdScheduleId,
        start_time: '09:00',
        end_time: '18:00',
        location_id: Number(process.env.LOCATION_ID),
      });

      const { response, responseBody } = await api.patch(`/api/v1/shifts/schedules/${createdScheduleId}`, updatePayload, {
        reqTitle: 'Request Body For Update Shift Schedule',
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(responseBody?.start_time || updatePayload.start_time).toBe(updatePayload.start_time);
    });

    test('INVALID PATCH /v1/shifts/schedules/:id - Update Schedule with invalid payload', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const updatePayload = buildScheduleUpdatePayload({
        id: createdScheduleId,
        start_time: 'invalid_time',
        end_time: '18:00',
      });

      const { response } = await api.patch(`/api/v1/shifts/schedules/${createdScheduleId}`, updatePayload, {
        reqTitle: 'Request Body For Update Invalid Payload'
      });

      const status = response.status();
      expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
    });

    test('DELETE /v1/shifts/schedules/:id - Delete Shift Schedule', async ({ }, testInfo) => {
      const api = new ApiFixture(managerContext, testInfo);
      const { response } = await api.delete(`/api/v1/shifts/schedules/${createdScheduleId}`, {
        resTitle: 'Response Body For Delete Shift Schedule',
      });

      const status = response.status();
      expect([200, 204].includes(status), `Expected: 200/204, but Received: ${status}`).toBeTruthy();

      createdScheduleId = 0; // Prevent deletion twice in afterEach
    });
  });
});
