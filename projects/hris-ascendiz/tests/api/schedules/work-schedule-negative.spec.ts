import { test, expect, APIRequestContext } from "@playwright/test";
import { getAccessToken } from "@hris-ascendiz/helpers/auth";
import {
  createSchedulePayload,
  generateRandomName,
} from "@hris-ascendiz/factories/work-schedule.factory";
import { ApiFixture } from "@shared/fixtures/api.fixture";
import { ENDPOINTS } from "@hris-ascendiz/config/endpoints";
import { setAllureLabels } from "@shared/helpers/allure-labels";

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe("Schedules API Tests - Negative Cases", () => {
  let apiContext: APIRequestContext;
  let validCompanies: any[] = [];
  let validJobPositions: any[] = [];
  let createdScheduleIds: number[] = [];

  const buildPayload = (overrides: any = {}) =>
    createSchedulePayload(validCompanies, validJobPositions, overrides);

  test.beforeAll(async ({ playwright, request }) => {
    const token = await getAccessToken(request);
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const compRes = await apiContext.get(ENDPOINTS.TENANTS.COMPANIES(10));
    validCompanies =
      (await compRes.json()).companies?.filter(
        (c: any) => c.parent_company_id !== null,
      ) || [];
    if (validCompanies.length === 0)
      throw new Error("Data Company tidak ditemukan!");

    const jobRes = await apiContext.get(`${ENDPOINTS.POSITIONS}?limit=30`);
    validJobPositions = (await jobRes.json()).positions || [];
    if (validJobPositions.length === 0)
      throw new Error("Data Job Position tidak ditemukan!");
  });

  test.afterAll(async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    for (const id of createdScheduleIds) {
      await api.delete(ENDPOINTS.SCHEDULES.BY_ID(id), {
        resTitle: "Response Body For Cleanup Delete Schedule",
      });
    }
    if (apiContext) await apiContext.dispose();
  });

  test.describe("Invalid Create Schedules", () => {
    test("TC-07: POST /v1/schedules - Cannot create if same time combination and BOTH are active", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);

      const payload1 = buildPayload({
        is_active: true,
        start_time: "09:15",
        end_time: "17:15",
        break_start_time: "12:15",
        break_end_time: "13:15",
      });
      const { response: res1, responseBody: body1 } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        payload1,
        {
          reqTitle: "Request Body For First Active Schedule",
        },
      );
      expect(res1.status()).toBe(201);
      if (body1?.schedule?.id) createdScheduleIds.push(body1.schedule.id);

      const payload2 = buildPayload({
        name: generateRandomName(),
        company_ids: payload1.company_ids,
        business_unit_ids: payload1.business_unit_ids,
        job_position_ids: payload1.job_position_ids,
        is_active: true,
        start_time: "09:15",
        end_time: "17:15",
        break_start_time: "12:15",
        break_end_time: "13:15",
      });

      const { response: res2, responseBody: body2 } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        payload2,
        {
          reqTitle: "Request Body For Conflicting Schedule",
        },
      );
      if (body2?.schedule?.id) createdScheduleIds.push(body2.schedule.id);
      const status = res2.status();
      expect(
        [400, 409, 422].includes(status),
        `Expected: 400/409/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-08: POST /v1/schedules - Create with duplicate name", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const duplicateName = generateRandomName();

      const { response: res1, responseBody: body1 } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        buildPayload({
          name: duplicateName,
          start_time: "10:15",
          end_time: "18:15",
          break_start_time: "13:15",
          break_end_time: "14:15",
        }),
        {
          reqTitle: "Request Body For Initial Schedule",
        },
      );
      expect(res1.status()).toBe(201);
      if (body1?.schedule?.id) createdScheduleIds.push(body1.schedule.id);

      const { response: res2, responseBody: body2 } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        buildPayload({
          name: duplicateName,
          start_time: "10:30",
          end_time: "18:30",
          break_start_time: "13:30",
          break_end_time: "14:30",
        }),
        {
          reqTitle: "Request Body For Duplicate Name Schedule",
        },
      );
      if (body2?.schedule?.id) createdScheduleIds.push(body2.schedule.id);
      const status = res2.status();
      expect(
        [400, 409, 422].includes(status),
        `Expected: 400/409/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-09: POST /v1/schedules - Invalid break start time", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        buildPayload({
          start_time: "06:15",
          end_time: "14:15",
          break_start_time: "05:00",
          break_end_time: "11:15",
        }),
        {
          reqTitle: "Request Body For Invalid Break Start Time",
        },
      );
      if (responseBody?.schedule?.id)
        createdScheduleIds.push(responseBody.schedule.id);
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-10: POST /v1/schedules - Invalid break end time", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        buildPayload({
          start_time: "07:15",
          end_time: "15:15",
          break_start_time: "11:15",
          break_end_time: "16:00",
        }),
        {
          reqTitle: "Request Body For Invalid Break End Time",
        },
      );
      if (responseBody?.schedule?.id)
        createdScheduleIds.push(responseBody.schedule.id);
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-11: POST /v1/schedules - Mismatch BU", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        buildPayload({
          company_ids: [1],
          business_unit_ids: [99999],
          start_time: "08:15",
          end_time: "16:15",
          break_start_time: "12:15",
          break_end_time: "13:15",
        }),
        {
          reqTitle: "Request Body For Mismatch BU",
        },
      );
      if (responseBody?.schedule?.id)
        createdScheduleIds.push(responseBody.schedule.id);
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-12: POST /v1/schedules - Invalid job position", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        buildPayload({
          job_position_ids: [99999999],
          start_time: "11:15",
          end_time: "19:15",
          break_start_time: "14:15",
          break_end_time: "15:15",
        }),
        {
          reqTitle: "Request Body For Invalid Job Position",
        },
      );
      if (responseBody?.schedule?.id)
        createdScheduleIds.push(responseBody.schedule.id);
      const status = response.status();
      expect(
        [400, 404, 422].includes(status),
        `Expected: 400/404/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-13: POST /v1/schedules - Invalid weekday", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        buildPayload({
          weekday: 8,
          start_time: "12:15",
          end_time: "20:15",
          break_start_time: "15:15",
          break_end_time: "16:15",
        }),
        {
          reqTitle: "Request Body For Invalid Weekday",
        },
      );
      if (responseBody?.schedule?.id)
        createdScheduleIds.push(responseBody.schedule.id);
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });
  });

  test.describe("Invalid Update and Delete Schedules", () => {
    let scheduleId: number;

    test.beforeEach(async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);

      const randomInt = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;
      const pad = (n: number) => n.toString().padStart(2, "0");

      const startHour = randomInt(6, 11);
      const startMin = randomInt(0, 59);

      const breakStartHour = randomInt(startHour + 2, startHour + 4);
      const breakStartMin = randomInt(0, 59);

      const breakEndHour = breakStartHour + 1;
      const breakEndMin = breakStartMin;

      const endHour = randomInt(breakEndHour + 2, 22);
      const endMin = randomInt(0, 59);

      const initialPayload = buildPayload({
        name: generateRandomName(),
        weekday: randomInt(0, 6),
        start_time: `${pad(startHour)}:${pad(startMin)}`,
        end_time: `${pad(endHour)}:${pad(endMin)}`,
        break_start_time: `${pad(breakStartHour)}:${pad(breakStartMin)}`,
        break_end_time: `${pad(breakEndHour)}:${pad(breakEndMin)}`,
      });

      const { responseBody } = await api.post(
        ENDPOINTS.SCHEDULES.BASE,
        initialPayload,
        {
          reqTitle: "Request Body For Dummy Data",
        },
      );
      scheduleId = responseBody?.schedule?.id;
      if (!scheduleId)
        throw new Error("Prerequisite: Gagal membuat schedule di beforeEach");
    });

    test.afterEach(async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      if (scheduleId) {
        await api.delete(ENDPOINTS.SCHEDULES.BY_ID(scheduleId), {
          resTitle: "Response Body For Cleanup Delete Dummy Schedule",
        });
        scheduleId = 0;
      }
    });

    test("TC-14: PATCH /v1/schedules/:id - Update with unregistered id", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.patch(
        ENDPOINTS.SCHEDULES.BY_ID(99999999),
        buildPayload({ start_time: "10:00" }),
        {
          reqTitle: "Request Body For Unregistered ID Patch",
        },
      );
      const status = response.status();
      expect(
        status === 404,
        `Expected: 404, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-15: PATCH /v1/schedules/:id - Update invalid break start time", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.patch(
        ENDPOINTS.SCHEDULES.BY_ID(scheduleId),
        buildPayload({ start_time: "11:00", break_start_time: "10:00" }),
        {
          reqTitle: "Request Body For Invalid Break Start Time Patch",
        },
      );
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-16: PATCH /v1/schedules/:id - Update invalid break end time", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.patch(
        ENDPOINTS.SCHEDULES.BY_ID(scheduleId),
        buildPayload({ end_time: "14:00", break_end_time: "15:00" }),
        {
          reqTitle: "Request Body For Invalid Break End Time Patch",
        },
      );
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-17: PATCH /v1/schedules/:id - Update mismatch BU", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.patch(
        ENDPOINTS.SCHEDULES.BY_ID(scheduleId),
        buildPayload({ company_ids: [1], business_unit_ids: [99999] }),
        {
          reqTitle: "Request Body For Mismatch BU Patch",
        },
      );
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-18: PATCH /v1/schedules/:id - Update invalid job position", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.patch(
        ENDPOINTS.SCHEDULES.BY_ID(scheduleId),
        buildPayload({ job_position_ids: [99999999] }),
        {
          reqTitle: "Request Body For Invalid Job Position Patch",
        },
      );
      const status = response.status();
      expect(
        [400, 404, 422].includes(status),
        `Expected: 400/404/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-19: DELETE /v1/schedules/:id - Delete unregistered id", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.delete(ENDPOINTS.SCHEDULES.BY_ID(99999999), {
        resTitle: "Response Body For Unregistered ID Delete",
      });
      const status = response.status();
      expect(
        status === 404,
        `Expected: 404, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-20: DELETE /v1/schedules/:id - Delete invalid id format", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.delete(ENDPOINTS.SCHEDULES.BY_ID('ADSFADSF'), {
        resTitle: "Response Body For Invalid Format ID Delete",
      });
      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });
  });
});
