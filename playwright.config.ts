import { defineConfig } from "@playwright/test";
import { config } from "dotenv";
config();

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["line"], ["allure-playwright", { resultsDir: "allure-results" }]],
  workers: process.env.CI ? 1 : undefined,

  projects: [
    // {
    //   name: "Ascendiz-API",
    //   testDir: "./projects/ascendiz/tests/api",
    //   use: {
    //     baseURL: process.env.ASCENDIZ_API_URL,
    //     extraHTTPHeaders: { Accept: "application/json" },
    //   },
    // },
    // {
    //   name: "Ascendiz-UI-Chrome",
    //   testDir: "./projects/ascendiz/tests/ui",
    //   use: {
    //     baseURL: process.env.ASCENDIZ_WEB_URL,
    //     browserName: "chromium",
    //     viewport: { width: 1280, height: 720 },
    //   },
    // },
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
    {
      name: "ProjectB-API",
      testDir: "./projects/project-b/tests/api",
      use: {
        baseURL: process.env.PROJECTB_API_URL,
        extraHTTPHeaders: { Accept: "application/json" },
      },
    },
  ],
});
