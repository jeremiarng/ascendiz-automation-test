import { test, expect, APIRequestContext } from "@playwright/test";
import { getAccessToken } from "@hris-ascendiz/helpers/auth";
import {
  buildCreatePayload,
  buildUpdatePayload,
} from "@hris-ascendiz/factories/office-list.factory";
import { ApiFixture } from "@shared/fixtures/api.fixture";
import { ENDPOINTS } from "@hris-ascendiz/config/endpoints";
import { setAllureLabels } from "@shared/helpers/allure-labels";

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe("Office List API Tests - Positive Cases", () => {
  let apiContext: APIRequestContext;
  let createdRecordIds: number[] = [];

  test.beforeAll(async ({ playwright, request }) => {
    const token = await getAccessToken(request);
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  test.afterAll(async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    for (const id of createdRecordIds) {
      await api.delete(ENDPOINTS.LOCATIONS.BY_ID(id), {
        resTitle: "Response Body For Cleanup Delete Location",
      });
    }
    if (apiContext) await apiContext.dispose();
  });

  test.describe("Read Master Data", () => {
    test("TC-04: GET /v1/provinces - List all provinces", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.PROVINCES,
        undefined,
        {
          resTitle: "Response Body For List Provinces",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(
        Array.isArray(responseBody?.provinces),
        "Expected provinces to be an array",
      ).toBeTruthy();
      expect(responseBody.provinces.length).toBeGreaterThan(0);
    });

    test("TC-05: GET /v1/cities?province_id=X - List cities by province", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { province_id: 30, limit: 500 };

      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.CITIES,
        params,
        {
          paramsTitle: "Request Params For List Cities By Province",
          resTitle: "Response Body For List Cities",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(
        Array.isArray(responseBody?.cities),
        "Expected cities to be an array",
      ).toBeTruthy();
      expect(responseBody.cities.length).toBeGreaterThan(0);

      const firstCity = responseBody.cities[0];
      expect(firstCity).toHaveProperty("id");
      expect(firstCity).toHaveProperty("city");
      expect(firstCity).toHaveProperty("province_id");
    });
  });

  test.describe("Read Location List", () => {
    test("TC-01: GET /v1/locations - List locations with pagination", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { offset: 0, limit: 10, name: "" };

      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.BASE,
        params,
        {
          paramsTitle: "Request Params For List Locations",
          resTitle: "Response Body For List Locations",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(
        Array.isArray(responseBody?.locations),
        "Expected locations to be an array",
      ).toBeTruthy();
    });

    test("TC-02: GET /v1/locations - Search location by name", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { offset: 0, limit: 10, name: "Pasar" };

      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.BASE,
        params,
        {
          paramsTitle: "Request Params For Search Location By Name",
          resTitle: "Response Body For Search Results",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(
        Array.isArray(responseBody?.locations),
        "Expected locations to be an array",
      ).toBeTruthy();
    });

    test("TC-03: GET /v1/locations - List all locations (limit=500)", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { limit: 500 };

      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.BASE,
        params,
        {
          paramsTitle: "Request Params For List All Locations",
          resTitle: "Response Body For All Locations",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(
        Array.isArray(responseBody?.locations),
        "Expected locations to be an array",
      ).toBeTruthy();
    });
  });

  test.describe
    .serial("Create, Read, Update, Delete Location Lifecycle", () => {
    let createdLocationId: number;
    let originalPayload: any;

    test("TC-06: POST /v1/locations - Create location successfully", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      originalPayload = buildCreatePayload();

      const { response, responseBody } = await api.postMultipart(
        ENDPOINTS.LOCATIONS.BASE,
        originalPayload,
        {
          reqTitle: "Request Body (multipart) For Create Location",
          resTitle: "Response Body For Create Location",
        },
      );

      const status = response.status();
      expect(
        [200, 201].includes(status),
        `Expected: 200/201, but Received: ${status}`,
      ).toBeTruthy();

      expect(responseBody).toHaveProperty("location");
      expect(responseBody.location.name).toBe(originalPayload.name);
      expect(responseBody.location.code).toBe(originalPayload.code);
      expect(responseBody.location.email).toBe(originalPayload.email);

      createdLocationId = responseBody.location.id;
      expect(createdLocationId).toBeDefined();
      createdRecordIds.push(createdLocationId);
    });

    test("TC-07: GET /v1/locations/:id - Get created location detail", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      expect(createdLocationId).toBeDefined();

      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.BY_ID(createdLocationId),
        undefined,
        {
          resTitle: "Response Body For Get Location Detail",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(responseBody.location.id).toBe(createdLocationId);
      expect(responseBody.location.name).toBe(originalPayload.name);
      expect(responseBody.location.code).toBe(originalPayload.code);
    });

    test("TC-08: PATCH /v1/locations/:id - Update location name & address", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const updatePayload = buildUpdatePayload();

      const { response, responseBody } = await api.patch(
        ENDPOINTS.LOCATIONS.BY_ID(createdLocationId),
        updatePayload,
        {
          reqTitle: "Request Body For Update Location",
          resTitle: "Response Body For Update Location",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();

      expect(responseBody.location.name).toBe(updatePayload.name);
      expect(responseBody.location.email).toBe(updatePayload.email);
    });

    test("TC-09: GET /v1/locations - Verify updated location in list", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { offset: 0, limit: 10, name: "" };

      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.BASE,
        params,
        {
          paramsTitle: "Request Params For Verify Updated Location",
          resTitle: "Response Body For Location List",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(
        Array.isArray(responseBody?.locations),
        "Expected locations to be an array",
      ).toBeTruthy();

      const found = responseBody.locations.find(
        (loc: any) => loc.id === createdLocationId,
      );
      expect(found, "Updated location should appear in the list").toBeTruthy();
    });

    test("TC-10: GET /v1/employees?location_id=X - View employees at location", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { location_id: createdLocationId, offset: 0, limit: 10 };

      const { response, responseBody } = await api.get(
        ENDPOINTS.LOCATIONS.EMPLOYEES,
        params,
        {
          paramsTitle: "Request Params For Employees At Location",
          resTitle: "Response Body For Employees List",
        },
      );

      const status = response.status();
      expect(
        [200].includes(status),
        `Expected: 200, but Received: ${status}`,
      ).toBeTruthy();
      expect(
        Array.isArray(responseBody?.employees),
        "Expected employees to be an array",
      ).toBeTruthy();
    });

    test("TC-11: DELETE /v1/locations/:id - Delete location", async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);

      const { response, responseBody } = await api.delete(
        ENDPOINTS.LOCATIONS.BY_ID(createdLocationId),
        {
          resTitle: "Response Body For Delete Location",
        },
      );

      const status = response.status();
      expect(
        [200, 204].includes(status),
        `Expected: 200/204, but Received: ${status}`,
      ).toBeTruthy();

      createdLocationId = 0;
    });
  });
});
