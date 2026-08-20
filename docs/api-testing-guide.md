# API Test Writing Guide

Guide untuk menulis API test yang konsisten dan maintainable, mengikuti pattern yang sudah diimplementasikan di proyek (contoh acuan: `projects/hris-ascendiz/tests/api/office-list/`).

## Struktur Direktori

```
projects/<project-name>/
├── config/
│   └── endpoints.ts          # Semua konstanta endpoint API
├── helpers/
│   └── auth.ts               # getAccessToken()
├── factories/
│   └── <module>.factory.ts   # Builder data test
└── tests/
    └── api/
        └── <module>/
            ├── <module>-positive.spec.ts
            └── <module>-negative.spec.ts
```

## Path Aliases

| Alias | Resolves To |
|-------|-------------|
| `@shared/fixtures/api.fixture` | `shared/fixtures/api.fixture` |
| `@shared/helpers/allure-labels` | `shared/helpers/allure-labels` |
| `@hris-ascendiz/helpers/auth` | `projects/hris-ascendiz/helpers/auth` |
| `@hris-ascendiz/factories/<name>` | `projects/hris-ascendiz/factories/<name>` |
| `@hris-ascendiz/config/endpoints` | `projects/hris-ascendiz/config/endpoints` |

Selalu gunakan path aliases, jangan relative path seperti `../../../`.

---

## Struktur Spec File

Setiap spec file API mengikuti kerangka berikut:

```typescript
import { test, expect, APIRequestContext } from "@playwright/test";
import { getAccessToken } from "@hris-ascendiz/helpers/auth";
import { buildCreatePayload } from "@hris-ascendiz/factories/<module>.factory";
import { ApiFixture } from "@shared/fixtures/api.fixture";
import { ENDPOINTS } from "@hris-ascendiz/config/endpoints";
import { setAllureLabels } from "@shared/helpers/allure-labels";

// WAJIB: hook beforeEach untuk label Allure epic/feature
test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe("<Module> API Tests - Positive Cases", () => {
  let apiContext: APIRequestContext;
  let unauthContext: APIRequestContext; // hanya untuk negative spec
  let createdRecords: { ... }[] = [];    // pelacakan data untuk cleanup

  test.beforeAll(async ({ playwright, request }) => {
    const token = await getAccessToken(request);
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    unauthContext = await playwright.request.newContext({});
  });

  test.afterAll(async ({}, testInfo) => {
    // Cleanup: hapus SEMUA data yang dibuat (termasuk record terkait)
    const api = new ApiFixture(apiContext, testInfo);
    for (const record of createdRecords) {
      // hapus child records dulu, lalu parent
    }
    if (apiContext) await apiContext.dispose();
    if (unauthContext) await unauthContext.dispose();
  });

  test("<TC-ID>: <METHOD> /endpoint - Description", async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    // ...
  });
});
```

---

## Positive Test Template

File: `tests/api/<module>/<module>-positive.spec.ts`

```typescript
test.describe("Read <Resource>", () => {
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
    expect(responseBody.locations.length).toBeGreaterThan(0);
  });
});

test.describe
  .serial("Create, Read, Update, Delete Location Lifecycle", () => {
  let createdId: number;
  let originalPayload: any;

  test("TC-02: POST /v1/locations - Create location successfully", async ({}, testInfo) => {
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

    createdId = responseBody.location.id;
    expect(createdId).toBeDefined();
    createdRecords.push({ locationId: createdId });
  });

  test("TC-03: GET /v1/locations/:id - Get created location detail", async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    expect(createdId).toBeDefined();

    const { response, responseBody } = await api.get(
      ENDPOINTS.LOCATIONS.BY_ID(createdId),
      undefined,
      { resTitle: "Response Body For Get Location Detail" },
    );

    expect(response.status()).toBe(200);
    expect(responseBody.location.id).toBe(createdId);
  });

  test("TC-04: PATCH /v1/locations/:id - Update location", async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    const updatePayload = buildUpdatePayload();

    const { response, responseBody } = await api.patch(
      ENDPOINTS.LOCATIONS.BY_ID(createdId),
      updatePayload,
      {
        reqTitle: "Request Body For Update Location",
        resTitle: "Response Body For Update Location",
      },
    );

    const status = response.status();
    expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
    expect(responseBody.location.name).toBe(updatePayload.name);
  });

  test("TC-05: DELETE /v1/locations/:id - Delete location", async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);

    const { response } = await api.delete(ENDPOINTS.LOCATIONS.BY_ID(createdId), {
      resTitle: "Response Body For Delete Location",
    });

    const status = response.status();
    expect([200, 204].includes(status), `Expected: 200/204, but Received: ${status}`).toBeTruthy();
    createdId = 0;
  });
});
```

---

## Negative Test Template

File: `tests/api/<module>/<module>-negative.spec.ts`

```typescript
test.describe("Authentication & Authorization", () => {
  test("TC-N01: GET /v1/locations - Access without Bearer token", async ({}, testInfo) => {
    const api = new ApiFixture(unauthContext, testInfo);
    const { response } = await api.get(ENDPOINTS.LOCATIONS.BASE, undefined, {
      resTitle: "Response Body For Unauthenticated Request",
    });

    const status = response.status();
    expect(
      [401, 403].includes(status),
      `Expected: 401/403, but Received: ${status}`,
    ).toBeTruthy();
  });
});

test.describe("Invalid Create", () => {
  test("TC-N02: POST /v1/locations - Create with missing required fields", async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    const payload = { code: generateRandomCode() };

    const { response, responseBody } = await api.postMultipart(
      ENDPOINTS.LOCATIONS.BASE,
      payload,
      {
        reqTitle: "Request Body For Missing Required Fields",
        resTitle: "Response Body For Missing Required Fields",
      },
    );

    // Jika API tetap membuat record (validasi tidak menolak), catat untuk cleanup
    if (responseBody?.location?.id) {
      createdRecords.push({ locationId: responseBody.location.id });
    }

    const status = response.status();
    expect(
      [400, 422].includes(status),
      `Expected: 400/422, but Received: ${status}`,
    ).toBeTruthy();
  });
});

test.describe("Invalid Read", () => {
  test("TC-N03: GET /v1/locations/:id - Non-existent ID", async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    const { response } = await api.get(ENDPOINTS.LOCATIONS.BY_ID(99999999), undefined, {
      resTitle: "Response Body For Non-Existent Location ID",
    });

    const status = response.status();
    expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
  });
});

test.describe("Invalid Update & Delete", () => {
  let tempId: number;

  // Prerequisite per-test: buat data dummy yang valid
  test.beforeEach(async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    const payload = buildCreatePayload();

    const { responseBody } = await api.postMultipart(
      ENDPOINTS.LOCATIONS.BASE,
      payload,
      { reqTitle: "Request Body For Dummy Location", resTitle: "Response Body For Dummy Location" },
    );
    tempId = responseBody?.location?.id;
    if (!tempId)
      throw new Error("Prerequisite: Failed to create dummy location in beforeEach");
    createdRecords.push({ locationId: tempId });
  });

  test("TC-N04: PATCH /v1/locations/:id - Update non-existent location", async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    const { response } = await api.patch(
      ENDPOINTS.LOCATIONS.BY_ID(99999999),
      buildUpdatePayload(),
      {
        reqTitle: "Request Body For Update Non-Existent Location",
        resTitle: "Response Body For Update Non-Existent Location",
      },
    );

    const status = response.status();
    expect([404].includes(status), `Expected: 404, but Received: ${status}`).toBeTruthy();
  });
});
```

---

## Aturan Utama

### 1. `test.describe.serial` untuk Lifecycle

Ketika test saling bergantung (create → read → update → delete), gunakan `test.describe.serial` agar dieksekusi berurutan dalam blok tersebut:

```typescript
test.describe
  .serial("Create, Read, Update, Delete Location Lifecycle", () => {
  let createdId: number;
  // variabel state dibagikan antar test di blok serial ini
});
```

### 2. Error Handling / Assertion Message

Selalu sertakan status code yang diharapkan DAN nilai aktual di dalam pesan assertion:

```typescript
expect(
  [200, 201].includes(status),
  `Expected: 200/201, but Received: ${status}`,
).toBeTruthy();
```

Gunakan array status code karena backend bisa mengembalikan beberapa variasi (misal `[400, 409, 422]` untuk duplicate, `[400, 404, 200]` untuk kasus yang tidak ditolak backend).

### 3. Cleanup Data di `afterAll`

Semua data yang dibuat selama test HARUS dihapus di `afterAll` — termasuk record yang dibuat otomatis oleh sistem (misal membuat location otomatis membuat office). Track id-nya di array `createdRecords`:

```typescript
let createdRecords: { locationId: number; officeId?: number }[] = [];

test.afterAll(async ({}, testInfo) => {
  const api = new ApiFixture(apiContext, testInfo);
  for (const record of createdRecords) {
    if (record.officeId) {
      await api.delete(ENDPOINTS.OFFICE_LIST.BY_ID(record.officeId), {
        resTitle: "Response Body For Cleanup Delete Office",
      });
    }
    await api.delete(ENDPOINTS.LOCATIONS.BY_ID(record.locationId), {
      resTitle: "Response Body For Cleanup Delete Location",
    });
  }
  if (apiContext) await apiContext.dispose();
  if (unauthContext) await unauthContext.dispose();
});
```

Catatan:
- Hapus child records dulu, baru parent.
- Pada negative spec, cek `if (responseBody?.location?.id)` sebelum push ke `createdRecords` — API kadang tetap membuat record meski mengembalikan error status.
- Test yang butuh data dummy valid sebagai prerequisite pakai `test.beforeEach` di dalam `describe` yang relevan.

### 4. Context Terpisah per Role

- `apiContext` — dengan Bearer token, untuk test positif.
- `unauthContext` — tanpa token, untuk test autentikasi/otorisasi.
- Buat context tambahan per role bila perlu (admin, employee, manager).
- Selalu `dispose()` semua context di `afterAll`.

### 5. Nama Test dengan TC-ID

Format nama test: `<TC-ID>: <METHOD> /endpoint - Description`

| Case | Format | Contoh |
|------|--------|--------|
| Positive | `TC-01`, `TC-02`, ... | `TC-01: GET /v1/locations - List locations with pagination` |
| Negative | `TC-N01`, `TC-N02`, ... | `TC-N01: GET /v1/locations/:id - Non-existent location ID` |

Gunakan `ENDPOINTS` untuk URL, jangan hardcode string.

---

## Factory Pattern

Factories membuat data test dengan default yang masuk akal dan dukungan override.

File: `factories/<module>.factory.ts`

```typescript
export const generateRandomName = (prefix = "Location_Test") => {
  return `${prefix}_${Math.floor(Math.random() * 100000000)}`;
};

export const generateRandomCode = (prefix = "TC") => {
  return `${prefix}${Math.floor(Math.random() * 10000)}`;
};

export const buildCreatePayload = (overrides: any = {}) => {
  const defaultPayload: Record<string, string | number> = {
    code: generateRandomCode(),
    name: generateRandomName(),
    email: "testlocation@ascendiz.id",
    // ... field lain
  };
  return { ...defaultPayload, ...overrides };
};

export const buildUpdatePayload = (overrides: any = {}) => {
  const defaultPayload: Record<string, string | number> = {
    name: generateRandomName("Updated_Location"),
    // ...
  };
  return { ...defaultPayload, ...overrides };
};
```

Pattern:
- `generateRandomName()` / `generateRandomCode()` — generator string unik, terima `prefix` opsional.
- `buildCreatePayload(overrides)` — body untuk POST.
- `buildUpdatePayload(overrides)` — body untuk PATCH.
- Selalu merge `...defaultPayload, ...overrides` agar override menang.

---

## Config & Endpoints

File: `config/endpoints.ts`

```typescript
export const ENDPOINTS = {
  LOCATIONS: {
    BASE: '/api/v1/locations',
    BY_ID: (id: number | string) => `/api/v1/locations/${id}`,
    PROVINCES: '/api/v1/provinces',
    CITIES: '/api/v1/cities',
    EMPLOYEES: '/api/v1/employees',
  },
} as const;
```

Gunakan `ENDPOINTS.MODULE.BASE` / `ENDPOINTS.MODULE.BY_ID(id)` di test — jangan hardcode URL.

---

## ApiFixture Methods

`ApiFixture` membungkus `APIRequestContext` dengan attachment Allure otomatis. Dokumentasi lengkap: `docs/fixture-guide/api-fixture-guide.md`.

```typescript
const api = new ApiFixture(apiContext, testInfo);

// GET dengan query params
const { response, responseBody } = await api.get('/endpoint', { limit: 10 }, {
  paramsTitle: 'Request Params',
  resTitle: 'Response Body',
});

// POST dengan JSON body
const { response, responseBody } = await api.post('/endpoint', { name: 'test' }, {
  reqTitle: 'Request Body',
  resTitle: 'Response Body',
});

// PATCH dengan JSON body
await api.patch('/endpoint/1', { name: 'updated' });

// DELETE
await api.delete('/endpoint/1');

// POST multipart/form-data — null/undefined otomatis difilter
await api.postMultipart('/endpoint', { field: 'value', file: '...' });
```

---

## Allure Labeling

Setiap spec file WAJIB punya hook `beforeEach`:

```typescript
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});
```

Hook ini membaca path file dan meng-assign:
- **Epic** = project name (misal `hris-ascendiz`)
- **Feature** = module name (misal `office-list`)

Lihat hierarki di tab **Behaviors** pada laporan Allure.

---

## Checklist: Menambahkan Module API Baru

1. Tambahkan entry di `config/endpoints.ts`
2. Buat `factories/<module>.factory.ts` berisi `buildCreatePayload`, `buildUpdatePayload`, dan generator
3. Buat `tests/api/<module>/<module>-positive.spec.ts`
4. Buat `tests/api/<module>/<module>-negative.spec.ts`
5. Tambahkan `test.beforeEach` dengan `setAllureLabels` di kedua spec
6. Tambahkan tracking `createdRecords` + cleanup di `afterAll`
7. Jalankan `npx tsc --noEmit` untuk verifikasi kompilasi
8. Jalankan `npm run t Hris-Ascendiz-API` untuk verifikasi test

---

## Naming Conventions

| Element | Convention | Contoh |
|---------|-----------|--------|
| Module directory | kebab-case | `office-list`, `shift-request-history` |
| Spec files | `<module>-positive.spec.ts` | `office-list-positive.spec.ts` |
| Factory files | `<module>.factory.ts` | `office-list.factory.ts` |
| Test describe | `"<Module> API Tests - Positive/Negative Cases"` | `"Office List API Tests - Positive Cases"` |
| Test name | `"<TC-ID>: <METHOD> /endpoint - Description"` | `"TC-01: GET /v1/locations - List locations"` |
| Variables | camelCase | `createdId`, `apiContext`, `createdRecords` |
| Consts | UPPER_SNAKE_CASE | `ENDPOINTS` |
