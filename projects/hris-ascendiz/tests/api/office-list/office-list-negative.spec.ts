import { test, expect, APIRequestContext } from "@playwright/test";
import { getAccessToken } from "@hris-ascendiz/helpers/auth";
import {
  buildCreatePayload,
  buildUpdatePayload,
  generateRandomCode,
} from "@hris-ascendiz/factories/office-list.factory";
import { ApiFixture } from "@hris-ascendiz/fixtures/api.fixture";
import { setAllureLabels } from "@shared/helpers/allure-labels";

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe("Office List API Tests - Negative Cases", () => {
  let apiContext: APIRequestContext;
  let unauthContext: APIRequestContext;
  let createdRecordIds: number[] = [];

  test.beforeAll(async ({ playwright, request }) => {
    const token = await getAccessToken(request);
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    unauthContext = await playwright.request.newContext({});
  });

  test.afterAll(async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    for (const id of createdRecordIds) {
      await api.delete(`/api/v1/locations/${id}`, {
        resTitle: "Response Body For Cleanup Delete Location",
      });
    }
    if (apiContext) await apiContext.dispose();
    if (unauthContext) await unauthContext.dispose();
  });

  test.describe("Authentication & Authorization", () => {
    test("TC-N08: GET /v1/locations - Access without Bearer token", async ({}, testInfo) => {
      const api = new ApiFixture(unauthContext, testInfo);
      const { response } = await api.get("/api/v1/locations", undefined, {
        resTitle: "Response Body For Unauthenticated Request",
      });

      const status = response.status();
      expect(
        [401, 403].includes(status),
        `Expected: 401/403, but Received: ${status}`,
      ).toBeTruthy();
    });
  });

  test.describe("Invalid Create Location", () => {
    test("TC-N02: POST /v1/locations - Create with missing required fields", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = { code: generateRandomCode() };

      const { response, responseBody } = await api.postMultipart(
        "/api/v1/locations",
        payload,
        {
          reqTitle: "Request Body For Missing Required Fields",
          resTitle: "Response Body For Missing Required Fields",
        },
      );

      if (responseBody?.location?.id) createdRecordIds.push(responseBody.location.id);

      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-N03: POST /v1/locations - Create with duplicate location code", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const duplicateCode = generateRandomCode();

      const firstPayload = buildCreatePayload({ code: duplicateCode });
      const { response: res1, responseBody: body1 } = await api.postMultipart(
        "/api/v1/locations",
        firstPayload,
        {
          reqTitle: "Request Body For First Location",
          resTitle: "Response Body For First Location",
        },
      );
      if (body1?.location?.id) createdRecordIds.push(body1.location.id);

      const secondPayload = buildCreatePayload({ code: duplicateCode });
      const { response: res2 } = await api.postMultipart(
        "/api/v1/locations",
        secondPayload,
        {
          reqTitle: "Request Body For Duplicate Code Location",
          resTitle: "Response Body For Duplicate Code Location",
        },
      );

      const status = res2.status();
      expect(
        [400, 409, 422].includes(status),
        `Expected: 400/409/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-N04: POST /v1/locations - Create with invalid email format", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildCreatePayload({ email: "invalid-email-format" });

      const { response, responseBody } = await api.postMultipart(
        "/api/v1/locations",
        payload,
        {
          reqTitle: "Request Body For Invalid Email Format",
          resTitle: "Response Body For Invalid Email Format",
        },
      );

      if (responseBody?.location?.id) createdRecordIds.push(responseBody.location.id);

      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-N05: POST /v1/locations - Create with invalid lat/lng values", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildCreatePayload({
        latitude: "invalid",
        longitude: "invalid",
      });

      const { response, responseBody } = await api.postMultipart(
        "/api/v1/locations",
        payload,
        {
          reqTitle: "Request Body For Invalid Lat/Lng",
          resTitle: "Response Body For Invalid Lat/Lng",
        },
      );

      if (responseBody?.location?.id) createdRecordIds.push(responseBody.location.id);

      const status = response.status();
      expect(
        [400, 422].includes(status),
        `Expected: 400/422, but Received: ${status}`,
      ).toBeTruthy();
    });
  });

  test.describe("Invalid Read Operations", () => {
    test("TC-N01: GET /v1/locations/:id - Non-existent location ID", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.get(
        "/api/v1/locations/99999999",
        undefined,
        {
          resTitle: "Response Body For Non-Existent Location ID",
        },
      );

      const status = response.status();
      expect(
        [404].includes(status),
        `Expected: 404, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-N09: GET /v1/locations - Negative pagination values", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { limit: -5, offset: -1 };

      const { response } = await api.get("/api/v1/locations", params, {
        paramsTitle: "Request Params For Negative Pagination",
        resTitle: "Response Body For Negative Pagination",
      });

      const status = response.status();
      expect(
        [400, 422, 200].includes(status),
        `Expected: 400/422/200, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-N10: GET /v1/cities?province_id=X - Invalid province ID", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { province_id: 99999 };

      const { response } = await api.get("/api/v1/cities", params, {
        paramsTitle: "Request Params For Invalid Province ID",
        resTitle: "Response Body For Invalid Province ID",
      });

      const status = response.status();
      expect(
        [400, 404, 200].includes(status),
        `Expected: 400/404/200, but Received: ${status}`,
      ).toBeTruthy();
    });

    test("TC-N11: GET /v1/employees?location_id=X - Non-existent location ID", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { location_id: 99999999, offset: 0, limit: 10 };

      const { response } = await api.get("/api/v1/employees", params, {
        paramsTitle: "Request Params For Non-Existent Location Employees",
        resTitle: "Response Body For Non-Existent Location Employees",
      });

      const status = response.status();
      expect(
        [400, 404, 200].includes(status),
        `Expected: 400/404/200, but Received: ${status}`,
      ).toBeTruthy();
    });
  });

  test.describe("Invalid Update & Delete", () => {
    let tempLocationId: number;

    test.beforeEach(async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildCreatePayload();

      const { responseBody } = await api.postMultipart(
        "/api/v1/locations",
        payload,
        {
          reqTitle: "Request Body For Dummy Location",
          resTitle: "Response Body For Dummy Location",
        },
      );
      tempLocationId = responseBody?.location?.id;
      if (!tempLocationId)
        throw new Error(
          "Prerequisite: Failed to create dummy location in beforeEach",
        );
      createdRecordIds.push(tempLocationId);
    });

    test("TC-N06: PATCH /v1/locations/:id - Update non-existent location", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.patch(
        "/api/v1/locations/99999999",
        buildUpdatePayload(),
        {
          reqTitle: "Request Body For Update Non-Existent Location",
          resTitle: "Response Body For Update Non-Existent Location",
        },
      );

      const status = response.status();
      expect(
        [404].includes(status),
        `Expected: 404, but Received: ${status}`,
      ).toBeTruthy();
    });

    // test("TC-N07: DELETE /v1/locations/:id - Delete location with employees assigned", async ({}, testInfo) => {
    //   const api = new ApiFixture(apiContext, testInfo);

    //   const { response, responseBody } = await api.delete(
    //     `/api/v1/locations/${tempLocationId}`,
    //     {
    //       resTitle: "Response Body For Delete Location With Employees",
    //     },
    //   );

    //   const status = response.status();
    //   expect(
    //     [400, 409, 422].includes(status),
    //     `Expected: 400/409/422, but Received: ${status}`,
    //   ).toBeTruthy();
    // });
  });
});
