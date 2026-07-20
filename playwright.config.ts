import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.STAGING_APP_URL;

if (!baseURL) {
  throw new Error("STAGING_APP_URL is required for staging browser E2E tests.");
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "outputs/playwright-report" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
