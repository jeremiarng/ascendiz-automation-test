import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { buildPayload, generateRandomName } from '@hris-ascendiz/factories/shift-template.factory';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';

test.describe('Shift Templates API Tests - Positive Cases', () => {
  let apiContext: APIRequestContext;
  let createdRecordIds: number[] = [];

  test.beforeAll(async ({ playwright, request }) => {
    const token = await getAccessToken(request);
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  });

  test.afterAll(async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    for (const id of createdRecordIds) {
      await api.delete(`/api/v1/shift-templates/${id}`, { resTitle: 'Response Body For Cleanup Delete Template' });
    }
    if (apiContext) await apiContext.dispose();
  });

  test.describe('Read Shift Templates', () => {
    test('GET /v1/shift-templates - List shifts with pagination limits and search', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { name: 'shift', limit: 5, offset: 0 };
      
      const { response, responseBody } = await api.get('/api/v1/shift-templates', params, {
        paramsTitle: 'Request Params For List Shift Templates'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(responseBody).toHaveProperty('meta');
      expect(responseBody).toHaveProperty('shifts');
    });
  });

  test.describe.serial('Create Shift Templates (Isolated)', () => {
    let createdId: number;
    let originalPayload: any;

    test('POST /v1/shift-templates - Create successfully', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      originalPayload = buildPayload();
      
      const { response, responseBody } = await api.post('/api/v1/shift-templates', originalPayload, {
        reqTitle: 'Request Body For Create Shift Template'
      });

      const status = response.status();
      expect([201, 200].includes(status), `Expected: 201, but Received: ${status}`).toBeTruthy();

      expect(responseBody).toHaveProperty('shift');
      expect(responseBody.shift.name).toBe(originalPayload.name);
      expect(responseBody.shift.start_time).toBe(originalPayload.start_time);

      createdId = responseBody.shift.id;
      expect(createdId).toBeDefined();
    });

    test('GET /v1/shift-templates/:id - Read successfully', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      expect(createdId).toBeDefined();
      
      const { response, responseBody } = await api.get(`/api/v1/shift-templates/${createdId}`, undefined, {
        resTitle: 'Response Body For Read Created Shift Template'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(responseBody.shift.id).toBe(createdId);
      expect(responseBody.shift.name).toBe(originalPayload.name);
    });

    test.afterAll(async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      if (createdId) {
        await api.delete(`/api/v1/shift-templates/${createdId}`, { resTitle: 'Response Body For Cleanup Delete Template' });
      }
    });
  });

  test.describe('Update and Delete Shift Templates', () => {
    let shiftId: number;

    test.beforeEach(async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const initialPayload = buildPayload();
      
      const { responseBody } = await api.post('/api/v1/shift-templates', initialPayload, {
        reqTitle: 'Request Body For Dummy Shift Template Data'
      });
      shiftId = responseBody?.shift?.id;
      if (!shiftId) throw new Error('Prerequisite: Gagal membuat shift template di beforeEach');
    });

    test.afterEach(async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      if (shiftId) {
        await api.delete(`/api/v1/shift-templates/${shiftId}`, { resTitle: 'Response Body For Cleanup Delete Dummy Template' });
        shiftId = 0;
      }
    });

    test('PATCH /v1/shift-templates/:id - Update successfully', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const updatePayload = buildPayload({
        name: generateRandomName('Updated_Shift'),
        end_time: '17:00',
      });

      const { response, responseBody } = await api.patch(`/api/v1/shift-templates/${shiftId}`, updatePayload, {
        reqTitle: 'Request Body For Update Shift Template'
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();

      expect(responseBody.shift.name).toBe(updatePayload.name);
      expect(responseBody.shift.end_time).toBe(updatePayload.end_time);
    });

    test('DELETE /v1/shift-templates/:id - Delete successfully', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.delete(`/api/v1/shift-templates/${shiftId}`, {
        resTitle: 'Response Body For Delete Shift Template'
      });

      const status = response.status();
      expect([200, 204].includes(status), `Expected: 200/204, but Received: ${status}`).toBeTruthy();
      if (responseBody?.message) {
        expect(responseBody.message).toBe('The shift has been deleted');
      }

      shiftId = 0; // Prevent afterEach from running it again
    });
  });
});
