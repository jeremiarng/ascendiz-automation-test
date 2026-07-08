# Test Writing Guide

This guide defines the conventions and patterns for writing consistent, maintainable tests across all projects in this mono-repo.

## Directory Structure

```
projects/<project-name>/
├── config/
│   ├── endpoints.ts          # All API endpoint constants
│   └── account-config.ts     # Environment-specific account config
├── helpers/
│   └── auth.ts               # getAccessToken() helper
├── factories/
│   └── <module>.factory.ts   # Test data builders
└── tests/
    ├── api/
    │   └── <module>/
    │       ├── <module>-positive.spec.ts
    │       └── <module>-negative.spec.ts
    └── ui/
        ├── pages/
        │   ├── LoginPage.ts
        │   └── DashboardPage.ts
        └── <flow>/
            └── <flow>.spec.ts
```

## Path Aliases

| Alias | Resolves To |
|-------|-------------|
| `@hris-ascendiz/helpers/auth` | `projects/hris-ascendiz/helpers/auth` |
| `@hris-ascendiz/factories/<name>` | `projects/hris-ascendiz/factories/<name>` |
| `@hris-ascendiz/fixtures/api.fixture` | `projects/hris-ascendiz/fixtures/api.fixture` |
| `@hris-ascendiz/config/endpoints` | `projects/hris-ascendiz/config/endpoints` |
| `@shared/helpers/allure-labels` | `shared/helpers/allure-labels` |

Always use path aliases, never relative paths like `../../../`.

---

## API Test Patterns

### Positive Test Template

File: `tests/api/<module>/<module>-positive.spec.ts`

```typescript
import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { buildCreatePayload } from '@hris-ascendiz/factories/<module>.factory';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('<Module> API Tests - Positive Cases', () => {
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

  test.describe('Read <Resource>', () => {
    test('GET /endpoint - List all <resource>', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const params = { offset: 0, limit: 10 };

      const { response, responseBody } = await api.get('/api/v1/endpoint', params, {
        paramsTitle: 'Request Params For List',
        resTitle: 'Response Body For List',
      });

      const status = response.status();
      expect([200].includes(status), `Expected: 200, but Received: ${status}`).toBeTruthy();
      expect(Array.isArray(responseBody?.items), 'Expected items to be an array').toBeTruthy();
    });
  });

  test.describe.serial('CRUD Lifecycle', () => {
    let createdId: number;

    test('POST /endpoint - Create resource', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = buildCreatePayload();

      const { response, responseBody } = await api.post('/api/v1/endpoint', payload, {
        reqTitle: 'Request Body For Create',
        resTitle: 'Response Body For Create',
      });

      const status = response.status();
      expect([200, 201].includes(status), `Expected: 200/201, but Received: ${status}`).toBeTruthy();
      expect(responseBody?.item?.id).toBeDefined();
      createdId = responseBody.item.id;
    });

    test('GET /endpoint/:id - Read created resource', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);

      const { response } = await api.get(`/api/v1/endpoint/${createdId}`, undefined, {
        resTitle: 'Response Body For Get Detail',
      });

      expect(response.status()).toBe(200);
    });
  });
});
```

### Negative Test Template

File: `tests/api/<module>/<module>-negative.spec.ts`

```typescript
import { test, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { buildCreatePayload } from '@hris-ascendiz/factories/<module>.factory';
import { ApiFixture } from '@hris-ascendiz/fixtures/api.fixture';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('<Module> API Tests - Negative Cases', () => {
  let apiContext: APIRequestContext;
  let unauthContext: APIRequestContext;

  test.beforeAll(async ({ playwright, request }) => {
    const token = await getAccessToken(request);
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    unauthContext = await playwright.request.newContext({});
  });

  test.afterAll(async () => {
    if (apiContext) await apiContext.dispose();
    if (unauthContext) await unauthContext.dispose();
  });

  test.describe('Authentication & Authorization', () => {
    test('GET /endpoint - Access without Bearer token', async ({}, testInfo) => {
      const api = new ApiFixture(unauthContext, testInfo);
      const { response } = await api.get('/api/v1/endpoint', undefined, {
        resTitle: 'Response Body For Unauthenticated Request',
      });
      expect([401, 403].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Invalid Create', () => {
    test('POST /endpoint - Create with missing required fields', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const payload = { name: '' };

      const { response } = await api.post('/api/v1/endpoint', payload, {
        reqTitle: 'Request Body For Missing Fields',
        resTitle: 'Response Body For Missing Fields',
      });

      expect([400, 422].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Invalid Read', () => {
    test('GET /endpoint/:id - Non-existent ID', async ({}, testInfo) => {
      const api = new ApiFixture(apiContext, testInfo);
      const { response } = await api.get('/api/v1/endpoint/99999999', undefined, {
        resTitle: 'Response Body For Non-Existent ID',
      });
      expect(response.status()).toBe(404);
    });
  });
});
```

### CRUD Lifecycle Rule

When tests depend on each other (create → read → update → delete), use `test.describe.serial` to ensure sequential execution within that block.

### Error Handling Pattern

Always include the expected status codes AND the actual received value in the assertion message:

```typescript
expect(
  [200, 201].includes(status),
  `Expected: 200/201, but Received: ${status}`,
).toBeTruthy();
```

---

## Factory Pattern

Factories create test data with sensible defaults and optional overrides.

File: `factories/<module>.factory.ts`

```typescript
interface CreatePayload {
  name: string;
  email: string;
  // ...
}

export const generateRandomName = (prefix = 'Test_') =>
  `${prefix}${Math.floor(Math.random() * 100000000)}`;

export const buildCreatePayload = (overrides: Partial<CreatePayload> = {}): CreatePayload => {
  const defaults: CreatePayload = {
    name: generateRandomName(),
    email: 'test@example.com',
    // ...
  };
  return { ...defaults, ...overrides };
};
```

Patterns:
- `generateRandomName()` / `generateRandomCode()` — unique string generators
- `buildCreatePayload(overrides)` — creates POST request bodies
- `buildUpdatePayload(overrides)` — creates PATCH request bodies
- Always merge `...defaults, ...overrides` so overrides take precedence

---

## Config & Endpoints

File: `config/endpoints.ts`

```typescript
export const ENDPOINTS = {
  MODULE: {
    BASE: '/api/v1/module',
    BY_ID: (id: number | string) => `/api/v1/module/${id}`,
  },
} as const;
```

Use `ENDPOINTS.MODULE.BASE` in tests instead of hardcoding URL strings.

---

## Tagging Convention

| Tag | Scope |
|-----|-------|
| `@smoke` | Critical smoke tests |
| `@regression` | Full regression suite |
| `@api` | API-specific |
| `@ui` | UI-specific |
| `@P0`, `@P1`, `@P2` | Priority level |

Usage:

```typescript
test.describe('Login', { tag: ['@smoke', '@ui'] }, () => {
  test('should login successfully', async () => { ... });
});
```

---

## Allure Labeling

Every test file **must** include the `test.beforeEach` hook to automatically set Allure epic/feature labels:

```typescript
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});
```

This reads the file path and assigns:
- **Epic** = project name (e.g., `hris-ascendiz`)
- **Feature** = module name (e.g., `all-schedules`, `attendance`)

View the hierarchy in Allure's **Behaviors** tab.

---

## UI Test Pattern

### Page Object Model

File: `tests/ui/pages/<PageName>.ts`

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator('[type="email"]');
    this.passwordInput = page.locator('[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### UI Test Spec

File: `tests/ui/<flow>/<flow>.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../pages';
import { setAllureLabels } from '@shared/helpers/allure-labels';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Login', { tag: ['@smoke', '@ui'] }, () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.ADMIN_EMAIL || 'admin@example.com',
      process.env.ADMIN_PASSWORD || 'password',
    );
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible({ timeout: 10000 });
  });
});
```

### Auth Setup (for authenticated UI tests)

The `Hris-Ascendiz-UI-Setup` project runs `auth.setup.ts` which logs in via the UI and saves storage state. The `Hris-Ascendiz-UI-Chrome` project depends on it and uses the saved state.

---

## ApiFixture Methods

The `ApiFixture` class wraps `APIRequestContext` with automatic Allure attachments:

```typescript
const api = new ApiFixture(apiContext, testInfo);

// GET with query params
const { response, responseBody } = await api.get('/endpoint', { limit: 10 }, {
  paramsTitle: 'Request Params',
  resTitle: 'Response Body',
});

// POST with JSON body
const { response, responseBody } = await api.post('/endpoint', { name: 'test' }, {
  reqTitle: 'Request Body',
  resTitle: 'Response Body',
});

// PATCH with JSON body
await api.patch('/endpoint/1', { name: 'updated' });

// DELETE
await api.delete('/endpoint/1');

// POST multipart/form-data
await api.postMultipart('/endpoint', { field: 'value', file: '...' });
```

---

## Checklist: Adding a New Module

1. Create `config/endpoints.ts` entries (or add to existing file)
2. Create `factories/<module>.factory.ts` with `buildCreatePayload`, `buildUpdatePayload`, and generators
3. Create `tests/api/<module>/<module>-positive.spec.ts`
4. Create `tests/api/<module>/<module>-negative.spec.ts`
5. Add `test.beforeEach` with `setAllureLabels` in both spec files
6. Run `npx tsc --noEmit` to verify compilation
7. Run `npm run t Hris-Ascendiz-API` to verify tests pass

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Module directory | kebab-case | `all-schedules`, `shift-request-history` |
| Spec files | `<module>-positive.spec.ts` | `work-schedule-positive.spec.ts` |
| Factory files | `<module>.factory.ts` | `work-schedule.factory.ts` |
| Test describe | `"<Module> API Tests - Positive Cases"` | `"Schedules API Tests - Positive Cases"` |
| Test name | `"<METHOD> /endpoint - Description"` | `"POST /v1/schedules - Create schedule successfully"` |
| Variables | camelCase | `createdId`, `apiContext` |
| Consts | UPPER_SNAKE_CASE | `ENDPOINTS`, `BUSINESS_UNIT_ID` |
