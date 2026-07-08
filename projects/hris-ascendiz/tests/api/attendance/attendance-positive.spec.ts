import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Attendance View API Tests - Positive Cases', () => {
    let adminContext: APIRequestContext;
    let managerContext: APIRequestContext;
    let employeeContext: APIRequestContext;

    // ID yang relevan berdasarkan dokumentasi API
    const SUPERIOR_ID = Number(process.env.SUPERIOR_ID);
    const SUBORDINATE_EMP_ID = Number(process.env.SUBORDINATE_ID);

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

    test.describe('View Attendance (Admin)', () => {
        test('TC-01: GET /v1/attendance/ - View all employee attendance', async ({ }, testInfo) => {
            const api = new ApiFixture(adminContext, testInfo);
            const { response, responseBody } = await api.get('/api/v1/attendance/', undefined, {
                resTitle: 'Response Body For All Employee Attendance'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
            expect(Array.isArray(responseBody?.attendances), 'Expected attendances to be an array').toBeTruthy();
        });

        test('TC-02: GET /v1/attendance/ - Search attendance by employee name', async ({ }, testInfo) => {
            const api = new ApiFixture(adminContext, testInfo);
            const params = { employee_name: 'salsa' };

            const { response, responseBody } = await api.get('/api/v1/attendance/', params, {
                paramsTitle: 'Request Params For Search By Name',
                resTitle: 'Response Body For Search Results'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();

            if (responseBody?.attendances && responseBody.attendances.length > 0) {
                const firstRecordName = responseBody.attendances[0].employee_name.toLowerCase();
                expect(firstRecordName.includes('salsa'), 'Expected employee name to contain search keyword').toBeTruthy();
            }
        });

        test('TC-03: GET /v1/attendance/ - Filter attendance by location and status', async ({ }, testInfo) => {
            const api = new ApiFixture(adminContext, testInfo);
            const params = { location_ids: String(process.env.LOCATION_ID), status_ids: '21' };

            const { response } = await api.get('/api/v1/attendance/', params, {
                paramsTitle: 'Request Params For Filter Location & Status'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
        });
    });

    test.describe('View Attendance (Employee)', () => {
        test('TC-04: GET /v1/attendance/me - View personal attendance list', async ({ }, testInfo) => {
            const api = new ApiFixture(employeeContext, testInfo);
            const { response, responseBody } = await api.get('/api/v1/attendance/me', undefined, {
                resTitle: 'Response Body For Personal Attendance'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
            expect(Array.isArray(responseBody?.attendances), 'Expected attendances to be an array').toBeTruthy();
        });

        test('TC-05: GET /v1/attendance/me/per-date - View personal attendance grouped by date', async ({ }, testInfo) => {
            const api = new ApiFixture(employeeContext, testInfo);
            const params = { date_from: '2026-06-26', date_to: '2026-06-30' };

            const { response, responseBody } = await api.get('/api/v1/attendance/me/per-date', params, {
                paramsTitle: 'Request Params For Personal Grouped Attendance'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
            expect(Array.isArray(responseBody?.attendances_by_date), 'Expected attendances_by_date to be an array').toBeTruthy();

            // Validasi PRD Acceptance Criteria: Jika multiple shifts, ada banyak object dalam attendances array per tanggal
            if (responseBody?.attendances_by_date && responseBody.attendances_by_date.length > 0) {
                expect(Array.isArray(responseBody.attendances_by_date[0].attendances), 'Inner attendances should be an array handling multiple shifts').toBeTruthy();
            }
        });

        test('TC-08: GET /v1/attendance/me/statistics - Get personal attendance statistics', async ({ }, testInfo) => {
            const api = new ApiFixture(employeeContext, testInfo);
            const { response, responseBody } = await api.get('/api/v1/attendance/me/statistics', undefined, {
                resTitle: 'Response Body For Personal Statistics'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
            expect(Array.isArray(responseBody?.statistics), 'Expected statistics to be an array').toBeTruthy();
        });
    });

    test.describe('View Subordinate Attendance (Manager)', () => {
        test('TC-06: GET /v1/attendance/superior/:id - View subordinate attendance', async ({ }, testInfo) => {
            const api = new ApiFixture(managerContext, testInfo);

            const { response, responseBody } = await api.get(`/api/v1/attendance/superior/${SUPERIOR_ID}`, undefined, {
                resTitle: 'Response Body For Subordinate Attendance'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
            expect(Array.isArray(responseBody?.attendances), 'Expected attendances to be an array').toBeTruthy();
        });

        test('TC-07: GET /v1/attendance/employee/:id/per-date - View subordinate attendance grouped by date', async ({ }, testInfo) => {
            const api = new ApiFixture(managerContext, testInfo);
            const params = { date_from: '2026-06-26', date_to: '2026-06-30' };

            const { response, responseBody } = await api.get(`/api/v1/attendance/employee/${SUBORDINATE_EMP_ID}/per-date`, params, {
                paramsTitle: 'Request Params For Subordinate Grouped Attendance'
            });

            const status = response.status();
            expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
            expect(Array.isArray(responseBody?.attendances_by_date), 'Expected attendances_by_date to be an array').toBeTruthy();
        });
    });
});