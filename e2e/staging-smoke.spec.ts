import { expect, test } from "@playwright/test";

const email = process.env.STAGING_TEST_EMAIL;
const password = process.env.STAGING_TEST_PASSWORD;

test("public pages and protected-route redirect work in staging", async ({ page }) => {
  const chunkResponses: string[] = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/assets/") && /\.(js|css)(?:$|\?)/.test(url)) {
      chunkResponses.push(`${response.status()} ${url}`);
    }
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Prime State Systems|React|Vite/i);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

  expect(chunkResponses.every((entry) => entry.startsWith("200 "))).toBe(true);
});

test("invalid invite link shows a safe error state", async ({ page }) => {
  await page.goto("/accept-invite?error=access_denied&error_description=Invite%20expired");

  await expect(page.getByRole("heading", { name: /invite could not be verified/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /accept invite/i })).toHaveCount(0);
});

test("staging test user can sign in and load dashboard", async ({ page }) => {
  test.skip(!email || !password, "Set STAGING_TEST_EMAIL and STAGING_TEST_PASSWORD to run login smoke.");

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).fill(password!);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.locator("body")).toContainText(/workflow|service|metric|activity/i);
});
