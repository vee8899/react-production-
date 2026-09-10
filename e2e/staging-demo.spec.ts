import { expect, test } from "@playwright/test";

test("the dedicated staging demo user processes an event through browser CORS", async ({ page }) => {
  const email = process.env.STAGING_DEMO_EMAIL;
  const password = process.env.STAGING_DEMO_PASSWORD;
  test.skip(!email || !password, "Set STAGING_DEMO_EMAIL and STAGING_DEMO_PASSWORD for the seeded demo tenant.");

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).fill(password!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "Northstar Realty Demo" })).toBeVisible();
  await expect(page.getByText("Loading workflow summary...")).toHaveCount(0);
  await expect(page.getByText("Runs · 30 days", { exact: true })).toBeVisible();
  const processed = page.waitForResponse((response) => response.url().includes("/functions/v1/demo-event") && response.request().method() === "POST");
  await page.getByRole("button", { name: "New lead received", exact: true }).click();
  const response = await processed;
  expect(response.status()).toBe(200);
  expect(response.headers()["access-control-allow-origin"]).toBe("*");
  expect(await response.json()).toMatchObject({ ok: true, event: "new_lead" });
  await expect(page.getByRole("status")).toHaveText("New lead received was processed through the demo workspace.");
  await expect(page.getByRole("button", { name: "New lead received", exact: true })).toBeEnabled();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
