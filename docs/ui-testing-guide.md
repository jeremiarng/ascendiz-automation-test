# UI Test Writing Guide

Guide untuk menulis UI test yang konsisten dan maintainable, mengikuti pattern yang sudah diimplementasikan di proyek (contoh acuan: `projects/hris-ascendiz/tests/ui/`).

## Struktur Direktori

```
projects/<project-name>/tests/ui/
├── pages/
│   ├── BasePage.ts            # Class dasar semua page objects
│   ├── LoginPage.ts           # Satu class per halaman/modul
│   ├── DashboardPage.ts
│   └── index.ts               # Barrel export
├── setup/
│   └── auth.setup.ts          # Login sekali, simpan storage state
├── login/
│   └── login.spec.ts          # Spec per flow
└── employee/
    └── employee-register.spec.ts
```

## Path Aliases

| Alias | Resolves To |
|-------|-------------|
| `@shared/fixtures/ui.fixture` | `shared/fixtures/ui.fixture` |
| `@shared/helpers/allure-labels` | `shared/helpers/allure-labels` |

Selalu gunakan path aliases. Untuk page objects, gunakan import dari `../pages` (barrel export) relatif terhadap folder spec:

```typescript
import { LoginPage, DashboardPage } from '../pages';
```

---

## Auth Setup (Storage State)

UI test memakai autentikasi via storage state, bukan login di setiap test.

`tests/ui/setup/auth.setup.ts` login sekali lewat UI dan menyimpan session:

```typescript
import { test as setup, expect } from '@playwright/test';

const authFile = '.auth/hris-admin.json';

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL/ADMIN_PASSWORD in .env. Login setup cannot run.');
  }

  await page.goto('/login?next=%252F');
  await page.getByRole('textbox', { name: 'Enter username or email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Attendance Management' }).first()).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```

Di `playwright.config.ts`, project UI memakai `storageState` dan bergantung pada project setup:

```typescript
{
  name: 'Hris-Ascendiz-UI',
  testDir: './projects/hris-ascendiz/tests/ui',
  use: {
    baseURL: process.env.HRIS_WEB_URL,
    browserName: 'chromium',
    viewport: { width: 1280, height: 720 },
    storageState: '.auth/hris-admin.json',
  },
  dependencies: ['Hris-Ascendiz-UI-Setup'],
},
{
  name: 'Hris-Ascendiz-UI-Setup',
  testDir: './projects/hris-ascendiz/tests/ui/setup',
  testMatch: 'auth.setup.ts',
  use: { baseURL: process.env.HRIS_WEB_URL, browserName: 'chromium' },
},
```

- Credentials WAJIB dari `.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) — jangan hardcode.
- Untuk test negatif login, reset storage state per test dengan `test.use({ storageState: { cookies: [], origins: [] } })`.

---

## Struktur Spec File

```typescript
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test, expect } from '@shared/fixtures/ui.fixture';
import { LoginPage, DashboardPage } from '../pages';

// WAJIB: hook beforeEach untuk label Allure epic/feature
test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe('Login - Positive Cases', { tag: ['@smoke', '@ui'] }, () => {
  test('P0: Login via saved storage state and verify dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto('/');
    await dashboard.expectDashboardVisible();
  });
});
```

Catatan penting:
- `test` dan `expect` diimpor dari `@shared/fixtures/ui.fixture` — bukan dari `@playwright/test` langsung. Fixture ini otomatis melampirkan screenshot + request/response network ke Allure.
- `page` digunakan langsung; autentikasi sudah tersedia via storage state.

---

## Page Object Model

### BasePage

Semua page class meng-extends `BasePage` yang menyediakan helper navigasi dan locator umum:

File: `tests/ui/pages/BasePage.ts`

```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  heading(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name });
  }

  menuLink(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }
}
```

### Halaman Spesifik

Satu class per halaman/modul. Locator didefinisikan sebagai `private readonly` field; aksi dikelompokkan dalam method `async`.

File: `tests/ui/pages/LoginPage.ts`

```typescript
import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator = this.page.getByRole('textbox', { name: 'Enter username or email' });
  private readonly passwordInput: Locator = this.page.getByRole('textbox', { name: 'Enter password' });
  private readonly signInButton: Locator = this.page.getByRole('button', { name: 'Sign In', exact: true });

  async login(email: string, password: string): Promise<void> {
    await this.goto('/login?next=%252F');
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

File: `tests/ui/pages/DashboardPage.ts`

```typescript
import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async expectDashboardVisible(): Promise<void> {
    await expect(this.menuLink('Attendance Management').first()).toBeVisible();
  }

  async navigateTo(menu: string | RegExp): Promise<void> {
    await this.menuLink(menu).first().click();
  }

  get attendanceMenu(): Locator {
    return this.menuLink(/Attendance Management/).first();
  }
}
```

### Barrel Export

Semua page class di-export dari `index.ts` agar spec mengimpor dari satu tempat:

File: `tests/ui/pages/index.ts`

```typescript
export { BasePage } from './BasePage';
export { LoginPage } from './LoginPage';
export { DashboardPage } from './DashboardPage';
```

Pattern POM:
- Locator dengan `getByRole` + accessible name — jangan `xpath` atau selector CSS yang brittle.
- Method `expect*` / verifikasi disimpan di page object (misal `expectDashboardVisible()`).
- Untuk menu sidebar yang berulang, gunakan helper `menuLink()` dari `BasePage`.

---

## Pattern Spec UI

### Login Positif (menggunakan storage state)

```typescript
test.describe('Login - Positive Cases', { tag: ['@smoke', '@ui'] }, () => {
  test('P0: Login via saved storage state and verify dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto('/');
    await dashboard.expectDashboardVisible();
  });
});
```

### Login Negatif (reset storage state)

```typescript
test.describe('Login - Negative Cases', { tag: ['@ui'] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('P1: Invalid password shows error and stays on login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(
      process.env.ADMIN_EMAIL || '',
      'WrongPassword_123'
    );
    await expect(page.getByText('Your password is incorrect')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter username or email' })).toBeVisible();
  });
});
```

### Flow Multi-Langkah (data unik + verifikasi sukses)

Untuk flow yang menulis data (register, create, dsb.), gunakan data unik per run agar tidak bentrok dengan data dari run sebelumnya:

```typescript
import { faker } from '@faker-js/faker';
import { test, expect } from '@shared/fixtures/ui.fixture';

test('Register new employee with all required fields', async ({ page }) => {
  // Unique test data — avoids "email already registered" from previous runs
  const username = `feri${faker.string.alphanumeric(5)}`;
  const email = `${username}@gmail.com`;

  // Login — reuse storage from auth.setup
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Attendance Management' }).first()).toBeVisible();

  // Navigate menu
  await page.getByRole('link', { name: /Employee Management/ }).click();
  await page.getByRole('link', { name: 'Employee Data' }).click();
  await expect(page.getByRole('heading', { name: 'Employee List' })).toBeVisible();

  // ...isi form per tab...

  // Verify success — success toast confirms the save
  await expect(page.getByText('Your data has been successfully saved.')).toBeVisible({ timeout: 10000 });
});
```

Aturan:
- **Verifikasi sukses positif**: tunggu toast sukses (misal `'Your data has been successfully saved.'`) — jangan pakai assertion negatif seperti `toHaveCount(0)` pada pesan error karena flaky.
- **Data unik per run** dengan `faker` (misal `faker.string.alphanumeric(5)`) untuk username/email/NIK/rekening.
- **Assertion URL** untuk memastikan navigasi berhasil: `await expect(page).toHaveURL(/\/attendance\/list/)`.
- Beri `timeout` eksplisit pada expect yang menunggu operasi lambat (misal `{ timeout: 10000 }`).

---

## ui.fixture — Screenshot & Network Attachments

`test` diimpor dari `@shared/fixtures/ui.fixture`, bukan `@playwright/test`. Fixture ini membungkus `page` dan otomatis:

1. **Screenshot full-page** — dilampirkan di akhir test (`SCREENSHOT` / `SCREENSHOT ON FAILURE`).
2. **Network attachments** — semua request/response XHR/fetch (POST, GET, PUT, PATCH) dengan body JSON dilampirkan sebagai `NETWORK - Request Body For <METHOD> <path>` dan `NETWORK - Response Body [<status>] For <METHOD> <path>`.

```typescript
import { test, expect } from '@shared/fixtures/ui.fixture';
```

Hasilnya, setiap test UI punya bukti visual (screenshot) dan bukti request/response API yang terjadi di halaman — tanpa menulis kode tambahan.

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
- **Feature** = module name dari direktori pertama di bawah `tests/ui/` (misal `login`, `employee`)

Lihat hierarki di tab **Behaviors** pada laporan Allure.

---

## Tagging Convention

| Tag | Scope |
|-----|-------|
| `@smoke` | Critical smoke tests |
| `@regression` | Full regression suite |
| `@ui` | UI-specific |
| `@api` | API-specific |
| `@P0`, `@P1`, `@P2` | Priority level |

Usage:

```typescript
test.describe('Login', { tag: ['@smoke', '@ui'] }, () => {
  test('should login successfully', async () => { ... });
});
```

---

## Checklist: Menambahkan Flow UI Baru

1. Buat page class di `tests/ui/pages/` (extends `BasePage`) dan export dari `index.ts`
2. Buat folder `tests/ui/<flow>/` berisi `<flow>.spec.ts`
3. Tambahkan `test.beforeEach` dengan `setAllureLabels`
4. Import `test, expect` dari `@shared/fixtures/ui.fixture`
5. Verifikasi selector dengan menjalankan test secara `--headed` bila perlu
6. Jalankan `npx tsc --noEmit` untuk verifikasi kompilasi
7. Jalankan `npm run t Hris-Ascendiz-UI` untuk verifikasi test

---

## Naming Conventions

| Element | Convention | Contoh |
|---------|-----------|--------|
| Page class | `<PageName>.ts`, PascalCase | `LoginPage.ts`, `DashboardPage.ts` |
| Page folder | `pages/` | — |
| Spec folder | kebab-case per flow | `login/`, `employee/` |
| Spec files | `<flow>.spec.ts` | `login.spec.ts`, `employee-register.spec.ts` |
| Test describe | `"<Flow> - Positive/Negative Cases"` | `"Login - Positive Cases"` |
| Test name | `"P<n>: description"` (priority prefix) | `"P0: Login via saved storage state"` |
| Locators | `getByRole` dengan accessible name | `getByRole('textbox', { name: 'Enter password' })` |
