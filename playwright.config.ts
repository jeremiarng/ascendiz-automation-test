import { defineConfig } from "@playwright/test";
import { config } from "dotenv";
config({ override: true });

export default defineConfig({
  fullyParallel: true,
  retries: 0,
  reporter: [["line"], ["allure-playwright", { resultsDir: "allure-results" }]],
  workers: 1,

  projects: [
    {
      name: 'Hris-Ascendiz-API',
      testDir: './projects/hris-ascendiz/tests/api',
      use: {
        baseURL: process.env.HRIS_API_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
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
      use: {
        baseURL: process.env.HRIS_WEB_URL,
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
