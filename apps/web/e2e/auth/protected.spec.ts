import { test, expect, loginAs } from "../helpers";

test.describe("Protected Routes", () => {
  test("redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects to login for map when unauthenticated", async ({ page }) => {
    await page.goto("/map");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects to login for profile when unauthenticated", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("allows access to home page without auth", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Livestock tracking");
  });

  test("allows access to login page without auth", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Wam Mfugo");
  });
});
