import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.PROJECTB_API_URL,
  },
});
