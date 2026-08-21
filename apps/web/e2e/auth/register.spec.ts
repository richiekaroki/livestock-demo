import { test, expect } from "../helpers";

test.describe("Registration Flow", () => {
  test("loads registration form", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("h1")).toContainText("Create Account");
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test("shows all required form fields", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#phone")).toBeVisible();
    await expect(page.locator("#county")).toBeVisible();
  });

  test("submit button is disabled when form is empty", async ({ page }) => {
    await page.goto("/register");

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test("shows login link", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("text=Already have an account?")).toBeVisible();
    await expect(page.locator("text=Sign in")).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/register");

    await page.click("text=Sign in");
    await expect(page).toHaveURL(/\/login/);
  });
});
