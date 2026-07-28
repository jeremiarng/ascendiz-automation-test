import { test, expect, APIRequestContext } from "@playwright/test";
import { getAccessToken } from "@hris-ascendiz/helpers/auth";
import {
  createSchedulePayload,
  generateRandomName,
  getRandomItem,
  getNextJobPosition,
} from "@hris-ascendiz/factories/work-schedule.factory";
import { ApiFixture } from "@shared/fixtures/api.fixture";
import { ENDPOINTS } from "@hris-ascendiz/config/endpoints";
import { setAllureLabels } from "@shared/helpers/allure-labels";

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe("Schedules API Tests - Positive Cases", () => {
  let apiContext: APIRequestContext;
  let validCompanies: any[] = [];
  let validJobPositions: any[] = [];

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

  test.afterAll(async () => {
    if (apiContext) await apiContext.dispose();
  });

  test.describe("Read Schedules", () => {
    test("TC-01: GET /v1/schedules - Request with various parameters successfully", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = {
        search: "day",
        job_position_id: getRandomItem(validJobPositions).id,
        is_active: false,
        limit: 5,
        offset: 0,
      };

      const { response, responseBody } = await api.get(
        ENDPOINTS.SCHEDULES.BASE,
        params,
        {
          paramsTitle: "Request Params For Checking Data",
        },
      );

      expect(response.status()).toBe(200);
      expect(responseBody).toHaveProperty("meta");
      expect(responseBody.meta).toHaveProperty("limit");
      expect(Array.isArray(responseBody.schedules)).toBeTruthy();
    });
  });

  test.describe("Create Schedules (Isolated)", () => {
    test("TC-02: POST /v1/schedules - Create schedule successfully", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      let localId: number | undefined;
      const payload = buildPayload({
        start_time: "08:00",
        end_time: "16:00",
        break_start_time: "12:00",
        break_end_time: "13:00",
      });

      try {
        const { response, responseBody } = await api.post(
          ENDPOINTS.SCHEDULES.BASE,
          payload,
          {
            reqTitle: "Request Body For Normal Create Data",
          },
        );
        localId = responseBody?.schedule?.id;

        expect(response.status()).toBe(201);
        expect(responseBody.schedule.name).toBe(payload.name);
        expect(localId).toBeDefined();
      } finally {
        if (localId) await apiContext.delete(ENDPOINTS.SCHEDULES.BY_ID(localId));
      }
    });

    test("TC-03: POST /v1/schedules - Create with multiple scopes", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      let localId: number | undefined;
      const comp1 = validCompanies[0];
      const comp2 =
        validCompanies.length > 1 ? validCompanies[1] : validCompanies[0];
      const job1 = getNextJobPosition(validJobPositions);
      const job2 = getNextJobPosition(validJobPositions);

      const payload = buildPayload({
        company_ids: Array.from(
          new Set([comp1.parent_company_id, comp2.parent_company_id]),
        ),
        business_unit_ids: Array.from(new Set([comp1.id, comp2.id])),
        job_position_ids: Array.from(new Set([job1.id, job2.id])),
        start_time: "09:00",
        end_time: "17:00",
        break_start_time: "13:00",
        break_end_time: "14:00",
      });

      try {
        const { response, responseBody } = await api.post(
          ENDPOINTS.SCHEDULES.BASE,
          payload,
          {
            reqTitle: "Request Body For Multiple Scopes Create",
          },
        );
        localId = responseBody?.schedule?.id;

        expect(response.status()).toBe(201);
        expect(responseBody.schedule.name).toBe(payload.name);
        expect(responseBody.schedule.scopes.length).toBeGreaterThanOrEqual(
          payload.company_ids.length,
        );
      } finally {
        if (localId) await apiContext.delete(ENDPOINTS.SCHEDULES.BY_ID(localId));
      }
    });

    test("TC-04: POST /v1/schedules - Can create if same time combination but existing is inactive", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      let createdIds: number[] = [];

      try {
        const payload1 = buildPayload({
          is_active: false,
          start_time: "04:15",
          end_time: "12:15",
          break_start_time: "08:15",
          break_end_time: "09:15",
        });
        const { response: res1, responseBody: body1 } = await api.post(
          ENDPOINTS.SCHEDULES.BASE,
          payload1,
          {
            reqTitle: "Request Body For First Inactive Schedule",
          },
        );
        if (body1?.schedule?.id) createdIds.push(body1.schedule.id);
        expect(res1.status()).toBe(201);

        const payload2 = buildPayload({
          name: generateRandomName(),
          company_ids: payload1.company_ids,
          business_unit_ids: payload1.business_unit_ids,
          job_position_ids: payload1.job_position_ids,
          is_active: true,
          start_time: "04:15",
          end_time: "12:15",
          break_start_time: "08:15",
          break_end_time: "09:15",
        });

        const { response: res2, responseBody: body2 } = await api.post(
          ENDPOINTS.SCHEDULES.BASE,
          payload2,
          {
            reqTitle: "Request Body For Conflicting Active Schedule",
          },
        );
        if (body2?.schedule?.id) createdIds.push(body2.schedule.id);
        expect(res2.status()).toBe(201);
      } finally {
        for (const id of createdIds) {
          await apiContext.delete(ENDPOINTS.SCHEDULES.BY_ID(id));
        }
      }
    });
  });

  test.describe("Update and Delete Schedules", () => {
    let scheduleId: number;
    let initialPayload: any;
    let testCounter = 0;

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

    test("TC-05: PATCH /v1/schedules/:id - Update schedule valid fields", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildPayload({
        name: generateRandomName(),
        is_active: false,
        end_time: "15:00",
      });

      const { response, responseBody } = await api.patch(
        ENDPOINTS.SCHEDULES.BY_ID(scheduleId),
        payload,
        {
          reqTitle: "Request Body For Updating Schedule Data",
        },
      );

      expect(response.status()).toBe(200);
      expect(responseBody.schedule.name).toBe(payload.name);
      expect(responseBody.schedule.end_time).toBe(payload.end_time);
    });

    test("TC-06: DELETE /v1/schedules/:id - Delete success", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.delete(
        ENDPOINTS.SCHEDULES.BY_ID(scheduleId),
        {
          resTitle: "Response Body For Deleted Schedule",
        },
      );

      if (responseBody?.message)
        expect(responseBody.message).toBe("The schedule has been deleted");
      const status = response.status();
      expect(
        [200, 204].includes(status),
        `Expected: 200/204, but Received: ${status}`,
      ).toBeTruthy();

      scheduleId = 0;
    });
  });
});
