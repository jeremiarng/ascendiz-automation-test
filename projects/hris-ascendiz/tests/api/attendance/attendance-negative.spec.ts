import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';

test.describe('Attendance View API Tests - Negative Cases', () => {
    let adminContext: APIRequestContext;
    let managerContext: APIRequestContext;
    let unauthContext: APIRequestContext;

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

    test.describe('Authentication & Authorization Validation', () => {
        test('TC-09: GET /v1/attendance/me - Access API without Bearer Token', async ({ }, testInfo) => {
            const api = new ApiFixture(unauthContext, testInfo);
            const { response } = await api.get('/api/v1/attendance/me', undefined, {
                resTitle: 'Response Body For Unauthenticated Request'
            });

            const status = response.status();
            expect([401, 403].includes(status), `Expected: 401/403, but Received: ${status}`).toBeTruthy();
        });

        test('TC-12: GET /v1/attendance/superior/:id - Manager viewing unauthorized subordinates', async ({ }, testInfo) => {
            const api = new ApiFixture(managerContext, testInfo);
            const { response, responseBody } = await api.get('/api/v1/attendance/superior/9999', undefined, {
                resTitle: 'Response Body For Unauthorized Superior ID'
            });

            const status = response.status();
            // Bisa 403 (Forbidden) atau 200 tapi list kosong (sesuai Acceptance Criteria TC-12)
            expect([403, 200].includes(status), `Expected: 403/200, but Received: ${status}`).toBeTruthy();

            if (status === 200) {
                const isEmpty = (Array.isArray(responseBody?.attendances) && responseBody.attendances.length === 0) || (responseBody?.attendance == null);
                expect(isEmpty, 'Expected empty attendance list when accessing unauthorized subordinate data').toBeTruthy();
            }
        });
    });

    test.describe('Parameter Validation & Edge Cases', () => {
        test('TC-10: GET /v1/attendance/me/per-date - Filter with invalid date logic (End < Start)', async ({ }, testInfo) => {
            const api = new ApiFixture(managerContext, testInfo);
            const params = { date_from: '2026-06-30', date_to: '2026-06-01' };

            const { response } = await api.get('/api/v1/attendance/me/per-date', params, {
                paramsTitle: 'Request Params For Invalid Date Logic'
            });

            const status = response.status();
            expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
        });

        test('TC-11: GET /v1/attendance/me - Filter with invalid date format', async ({ }, testInfo) => {
            const api = new ApiFixture(managerContext, testInfo);
            const params = { date_from: '26-06-2026' }; // Wrong format YYYY-MM-DD

            const { response } = await api.get('/api/v1/attendance/me', params, {
                paramsTitle: 'Request Params For Invalid Date Format'
            });

            const status = response.status();
            expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
        });

        test('TC-13: GET /v1/attendance/employee/:id - Get specific employee data with non-existent ID', async ({ }, testInfo) => {
            const api = new ApiFixture(adminContext, testInfo);
            const { response, responseBody } = await api.get('/api/v1/attendance/employee/000000', undefined, {
                resTitle: 'Response Body For Non-Existent Employee ID'
            });

            const status = response.status();
            // Sesuai TC-13: Response code 404 atau 200 dengan empty array
            expect([404, 200].includes(status), `Expected: 404/200, but Received: ${status}`).toBeTruthy();

            if (status === 200) {
                const isEmpty = (Array.isArray(responseBody?.attendances) && responseBody.attendances.length === 0) || (responseBody?.attendance == null);
                expect(isEmpty, 'Expected empty attendance array for non-existent employee').toBeTruthy();
            }
        });

        test('TC-14: GET /v1/attendance/ - List attendance with negative pagination limits', async ({ }, testInfo) => {
            const api = new ApiFixture(adminContext, testInfo);
            const params = { limit: -5, offset: -1 };

            const { response } = await api.get('/api/v1/attendance/', params, {
                paramsTitle: 'Request Params For Negative Pagination'
            });

            const status = response.status();
            // Sesuai TC-14: 400 Bad Request atau 200 dengan fallback ke pagination default
            expect([400, 422, 200].includes(status), `Expected: 400/422/200, but Received: ${status}`).toBeTruthy();
        });
    });
});