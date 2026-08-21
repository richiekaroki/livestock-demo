import { test, expect, requestOtp } from "../helpers";

test.describe("Login Flow", () => {
  test("loads login page with email form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toContainText("Wam Mfugo");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Send OTP");
  });

  test("shows OTP form after requesting code", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "test@example.com");
    await page.click('button[type="submit"]');

    // Should show OTP input
    await expect(page.locator('input[maxlength="6"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[type="submit"]')).toContainText("Verify");
  });

  test("shows email in OTP step description", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "test@example.com");
    await page.click('button[type="submit"]');

    await page.waitForSelector('input[maxlength="6"]', { timeout: 10000 });
    await expect(page.locator("text=test@example.com")).toBeVisible();
  });

  test("can go back to email step", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "test@example.com");
    await page.click('button[type="submit"]');

    await page.waitForSelector('input[maxlength="6"]', { timeout: 10000 });

    await page.click("text=Use a different email");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("shows register link", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("text=Don't have an account?")).toBeVisible();
    await expect(page.locator("text=Register")).toBeVisible();
  });

  test("navigates to register page", async ({ page }) => {
    await page.goto("/login");

    await page.click("text=Register");
    await expect(page).toHaveURL(/\/register/);
  });
});
