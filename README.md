# Playwright Test Automation Mono-Repo

Centralized test automation using Playwright's multi-project support for API and UI testing across multiple applications.

## Prerequisites

- Node.js 18+
- Git
- Allure CLI (for reports)
  ```powershell
  npm install -g allure-commandline
  ```

## Quick Start

```powershell
npm install
npx playwright install
```

Copy `.env` from the template and fill in your credentials:

```
HRIS_API_URL=https://api.your-domain.com
HRIS_WEB_URL=https://app.your-domain.com
ADMIN_EMAIL=your-email
ADMIN_PASSWORD=your-password
```

## Project Structure

```
playwright-automation/
├── package.json
├── playwright.config.ts          # Root config (projects, reporters)
├── tsconfig.json                 # Path aliases (@shared, @hris-ascendiz, etc.)
├── .env                          # Environment variables (gitignored)
│
├── shared/                       # Reusable across all projects
│   ├── fixtures/
│   │   └── api.fixture.ts        # Class-based API wrapper with Allure logging
│   ├── helpers/
│   │   ├── allure-labels.ts      # Auto-set epic/feature labels from file path
│   │   └── logger.ts             # Allure attachment logger
│   └── config/
│       └── index.ts              # Shared constants
│
├── projects/
│   ├── hris-ascendiz/            # Active project
│   │   ├── playwright.config.ts
│   │   ├── config/
│   │   │   ├── endpoints.ts      # API endpoint constants
│   │   │   └── account-config.ts
│   │   ├── helpers/
│   │   │   └── auth.ts           # getAccessToken()
│   │   ├── factories/            # Test data builders
│   │   │   ├── office-list.factory.ts
│   │   │   ├── work-schedule.factory.ts
│   │   │   └── ...
│   │   └── tests/
│   │       ├── api/              # API test specs by module
│   │       │   ├── attendance/
│   │       │   ├── office-list/
│   │       │   ├── schedules/
│   │       │   └── ...
│   │       └── ui/               # UI test specs
│   │           ├── pages/        # Page Object Models
│   │           ├── login/
│   │           └── dashboard/
│   │
│   └── project-b/                # Future project (same structure)
│
├── scripts/
│   ├── test.js                   # Dynamic project test runner
│   └── deploy-report.ps1         # Deploy Allure report to GitHub Pages
│
├── test-results/                 # Playwright output (gitignored)
├── allure-results/               # Allure raw results (gitignored)
├── allure-report/                # Generated HTML report (gitignored)
└── .auth/                        # Auth storage state (gitignored)
```

## Running Tests

| Command | Description |
|---------|-------------|
| `npm run test` | Run all projects |
| `npm run t Hris-Ascendiz-API` | Run single project (API) |
| `npm run t Hris-Ascendiz-UI-Chrome` | Run single project (UI) |
| `npm run test:smoke` | Run smoke-tagged tests only |
| `npm run t Ascendiz-API` | Run another project |

### Headed mode (for UI debugging)

```powershell
npm run t Hris-Ascendiz-UI-Chrome -- --headed
```

### Record tests with Codegen

```powershell
npx playwright codegen https://app.your-domain.com
```

With saved auth state:

```powershell
npx playwright codegen --load-storage=.auth/hris-admin.json https://app.your-domain.com
```

## Allure Reports

### Generate locally

```powershell
npm run report
```

Opens the report in your browser automatically.

### Deploy to GitHub Pages

```powershell
npm run deploy:report
npm run deploy:report -- Hris-Ascendiz-API
npm run deploy:report -- Hris-Ascendiz-API -SkipTests
```

- Without arguments: runs all tests, generates report, deploys
- With project name: runs single project, generates report, deploys
- `-SkipTests`: uses existing `allure-results/`, just regenerates and deploys

Reports are deployed to the `gh-pages` branch. View at:

```
https://<org>.github.io/ascendiz-playwright-automation/
```

Module separation is visible in the Allure **Behaviors** tab:

```
Epic: hris-ascendiz
  Feature: all-schedules
  Feature: attendance
  Feature: office-list
  Feature: schedules
  Feature: shift-request-history
  Feature: shift-template
```

## Git Workflow

### Push new test code

```powershell
git add -A
git commit -m "test: add <module> tests"
git push origin main
```

### Push test code + deploy report

```powershell
git add -A
git commit -m "test: add <module> tests"
git push origin main
npm run deploy:report -- Hris-Ascendiz-API
```

## Path Aliases

Defined in `tsconfig.json`:

| Alias | Resolves To |
|-------|-------------|
| `@shared/*` | `shared/*` |
| `@hris-ascendiz/*` | `projects/hris-ascendiz/*` |
| `@ascendiz/*` | `projects/ascendiz/*` |
| `@project-b/*` | `projects/project-b/*` |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HRIS_API_URL` | HRIS backend API base URL |
| `HRIS_WEB_URL` | HRIS web app base URL |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `MANAGER_EMAIL` | Manager login email |
| `MANAGER_PASSWORD` | Manager login password |
| `EMPLOYEE_EMAIL` | Employee login email |
| `EMPLOYEE_PASSWORD` | Employee login password |
| `SUBORDINATE_ID` | Employee ID under manager |
| `LOCATION_ID` | Default location ID |
| `COMPANY_ID` | Default company ID |
| `BUSINESS_UNIT_ID` | Default business unit ID |
| `DEPARTMENT_ID` | Default department ID |
| `JOB_POSITION_ID` | Default job position ID |

## Project Configuration

All Playwright projects are defined in `playwright.config.ts`. To register a new project:

```typescript
{
  name: 'MyProject-API',
  testDir: './projects/my-project/tests/api',
  use: {
    baseURL: process.env.MY_PROJECT_API_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
},
```

## Troubleshooting

### PowerShell execution policy

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### `.env` file missing

The `.env` file is gitignored. If it gets deleted, recreate it from the template or ask a teammate for the values.

### TypeScript compilation errors

```powershell
npx tsc --noEmit
```
