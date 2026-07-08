import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { buildPayload } from '@hris-ascendiz/factories/shift-template.factory';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Shift Templates API Tests - Negative Cases', () => {
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

  test.describe('Invalid Create Shift Templates', () => {
    test('POST /v1/shift-templates - Create with invalid time format', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildPayload({ start_time: '25:00' });
      
      const { response } = await api.post('/api/v1/shift-templates', payload, {
        reqTitle: 'Request Body For Invalid Time Format'
      });

      const status = response.status();
      expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
    });

    test('POST /v1/shift-templates - End time is earlier than Start time without next-day flag', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildPayload({ 
        start_time: '15:00', 
        end_time: '07:00', 
        is_end_time_next_day: false 
      });
      
      const { response } = await api.post('/api/v1/shift-templates', payload, {
        reqTitle: 'Request Body For End Time Earlier Than Start Time'
      });

      const status = response.status();
      expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
    });

    test('POST /v1/shift-templates - Create with break end time earlier than break start time', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildPayload({ 
        break_start_time: '14:00', 
        break_end_time: '13:00' 
      });
      
      const { response } = await api.post('/api/v1/shift-templates', payload, {
        reqTitle: 'Request Body For Invalid Break Times'
      });

      const status = response.status();
      expect([400, 422].includes(status), `Expected: 400/422, but Received: ${status}`).toBeTruthy();
    });

    test('POST /v1/shift-templates - Create with duplicate name', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const initialPayload = buildPayload();
      
      const { response: res1, responseBody: body1 } = await api.post('/api/v1/shift-templates', initialPayload, {
        reqTitle: 'Request Body For Initial Template'
      });
      if (body1?.shift?.id) createdRecordIds.push(body1.shift.id);

      const { response: res2 } = await api.post('/api/v1/shift-templates', initialPayload, {
        reqTitle: 'Request Body For Duplicate Name Template'
      });
      
      const status = res2.status();
      expect([400, 409, 422].includes(status), `Expected: 400/409/422, but Received: ${status}`).toBeTruthy();
    });
  });

  test.describe('Invalid Read Shift Templates', () => {
    test('GET /v1/shift-templates/:id - Get using a non-existent ID', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.get('/api/v1/shift-templates/99999999', undefined, {
        resTitle: 'Response Body For Non-Existent ID'
      });

      const status = response.status();
      expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
    });
  });

  // Note: For Shift Templates, the previous negative tests only included GET non-existent ID and POST validations.
  // The structure natively doesn't have negative PATCH/DELETE in the original independent test, but it is covered by the positive test verifying deletion with 404.
});
