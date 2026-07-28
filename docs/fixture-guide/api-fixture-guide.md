# ApiFixture Guide

`ApiFixture` adalah wrapper class untuk Playwright `APIRequestContext` yang secara otomatis melampirkan (attach) request dan response ke laporan Allure.

## Import

```typescript
import { ApiFixture } from '@shared/fixtures/api.fixture';
```

## Constructor

```typescript
const api = new ApiFixture(apiContext, testInfo);
```

| Parameter | Type | Deskripsi |
|-----------|------|-----------|
| `apiContext` | `APIRequestContext` | Playwright API context (dari `playwright.request.newContext()`) |
| `testInfo` | `TestInfo` | Objek `testInfo` dari callback test Playwright |

## Method Reference

Semua method mengembalikan `Promise<{ response: APIResponse; responseBody: any }>`.

### GET

```typescript
api.get(url, params?, options?)
```

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `url` | `string` | ✅ | — |
| `params` | `Record<string, string \| number \| boolean \| undefined>` | ❌ | `undefined` |
| `options.paramsTitle` | `string` | ❌ | `"Request Params For GET {url}"` |
| `options.resTitle` | `string` | ❌ | `"Response Body [{status}] For GET {url}"` |

**Contoh:**

```typescript
const { response, responseBody } = await api.get('/api/v1/items', { limit: 10, offset: 0 }, {
  paramsTitle: 'Request Params For List Items',
  resTitle: 'Response Body For List Items',
});
```

### POST

```typescript
api.post(url, data?, options?)
```

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `url` | `string` | ✅ | — |
| `data` | `any` | ❌ | `undefined` |
| `options.reqTitle` | `string` | ❌ | `"Request Body For POST {url}"` |
| `options.params` | `Record` | ❌ | `undefined` |
| `options.paramsTitle` | `string` | ❌ | `"Request Params For POST {url}"` |
| `options.resTitle` | `string` | ❌ | `"Response Body [{status}] For POST {url}"` |

**Contoh:**

```typescript
const { response, responseBody } = await api.post('/api/v1/items', { name: 'test', price: 100 }, {
  reqTitle: 'Request Body For Create Item',
  resTitle: 'Response Body For Create Item',
});
```

### PATCH

```typescript
api.patch(url, data?, options?)
```

Parameter sama dengan POST.

**Contoh:**

```typescript
const { response, responseBody } = await api.patch(`/api/v1/items/${id}`, { name: 'updated' }, {
  reqTitle: 'Request Body For Update Item',
  resTitle: 'Response Body For Update Item',
});
```

### DELETE

```typescript
api.delete(url, options?)
```

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `url` | `string` | ✅ | — |
| `options.resTitle` | `string` | ❌ | `"Response Body [{status}] For DELETE {url}"` |

**Contoh:**

```typescript
const { response, responseBody } = await api.delete(`/api/v1/items/${id}`, {
  resTitle: 'Response Body For Delete Item',
});
```

### POST Multipart

```typescript
api.postMultipart(url, data, options?)
```

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `url` | `string` | ✅ | — |
| `data` | `Record<string, any>` | ✅ | — |
| `options.reqTitle` | `string` | ❌ | `"Request Body (multipart) For POST {url}"` |
| `options.resTitle` | `string` | ❌ | `"Response Body [{status}] For POST {url}"` |

Nilai `null` dan `undefined` dalam `data` otomatis difilter (tidak dikirim).

**Contoh:**

```typescript
const { response, responseBody } = await api.postMultipart('/api/v1/locations', {
  name: 'Office A',
  code: 'OFC-A',
  email: 'office@example.com',
}, {
  reqTitle: 'Request Body For Create Location',
  resTitle: 'Response Body For Create Location',
});
```

## Allure Integration

Setiap method secara otomatis melampirkan ke test Allure:

| Method | Attachments |
|--------|-------------|
| GET | Request params → `paramsTitle`, Response body → `resTitle` |
| POST | Request body → `reqTitle`, Request params → `paramsTitle`, Response body → `resTitle` |
| PATCH | Request body → `reqTitle`, Request params → `paramsTitle`, Response body → `resTitle` |
| DELETE | Response body → `resTitle` |
| POST Multipart | Request body → `reqTitle`, Response body → `resTitle` |

## Error Handling

`responseBody` akan bernilai `null` jika response tidak mengandung JSON yang valid (misalnya response kosong, atau response bukan JSON). Hal ini ditangani oleh method internal `safeJson()`:

```typescript
private async safeJson(response: any): Promise<any> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
```

## Best Practices

1. **Gunakan bersama ENDPOINTS config** — jangan hardcode URL, gunakan `ENDPOINTS` dari `config/endpoints.ts`:

```typescript
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';

const { response } = await api.get(ENDPOINTS.ATTENDANCE.BASE, params);
```

2. **Gunakan `testInfo` dari parameter test** — jangan dari luar scope:

```typescript
test('test name', async ({}, testInfo) => {
  const api = new ApiFixture(apiContext, testInfo);
});
```

3. **Buat context terpisah untuk role berbeda** — jangan pakai satu context untuk semua role:

```typescript
const adminApi = new ApiFixture(adminContext, testInfo);
const employeeApi = new ApiFixture(employeeContext, testInfo);
```

4. **Selalu dispose context di `afterAll`**:

```typescript
test.afterAll(async () => {
  if (apiContext) await apiContext.dispose();
});
```

## Contoh Lengkap

```typescript
import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ApiFixture } from '@shared/fixtures/api.fixture';
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Items API Tests - Positive Cases', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright, request }) => {
    const token = await getAccessToken(request);
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
  });

  test.afterAll(async () => {
    if (apiContext) await apiContext.dispose();
  });

  test('GET /items - List items', async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    const { response } = await api.get(ENDPOINTS.ITEMS.BASE, { limit: 10 });
    expect(response.status()).toBe(200);
  });

  test('POST /items - Create item', async ({}, testInfo) => {
    const api = new ApiFixture(apiContext, testInfo);
    const { response } = await api.post(ENDPOINTS.ITEMS.BASE, { name: 'test' });
    expect([200, 201].includes(response.status())).toBeTruthy();
  });
});
```
