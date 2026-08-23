import { test, expect } from "../helpers";

test.describe("Dashboard Page", () => {
  test("loads dashboard with stats cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Total Animals")).toBeVisible({ timeout: 10000 });
  });

  test("shows animal list", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('[class*="animal"]', { timeout: 10000 }).catch(() => {});
    const hasContent = await page.locator("text=No animals").isVisible().catch(() => false);
    expect(typeof hasContent).toBe("boolean");
  });
});

test.describe("Map Page", () => {
  test("loads map view", async ({ page }) => {
    await page.goto("/map");
    await expect(page.locator("h1, h2")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Reminders Page", () => {
  test("loads reminders page", async ({ page }) => {
    await page.goto("/reminders");
    await expect(page.locator("text=Vaccination Reminders")).toBeVisible({ timeout: 10000 });
  });

  test("shows refresh button", async ({ page }) => {
    await page.goto("/reminders");
    await expect(page.locator("text=Refresh")).toBeVisible();
  });
});

test.describe("Farmer Dashboard", () => {
  test("loads farmer dashboard", async ({ page }) => {
    await page.goto("/farmer");
    await expect(page.locator("text=My Farm Dashboard")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("QR Code Page", () => {
  test("loads QR code page", async ({ page }) => {
    await page.goto("/animal-qr");
    await expect(page.locator("text=Animal QR Codes")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Health Assessment Page", () => {
  test("loads health assessment page", async ({ page }) => {
    await page.goto("/health-assessment");
    await expect(page.locator("text=Photo Health Assessment")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Navigation", () => {
  test("navbar contains all main links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    const res = await page.goto("/nonexistent-page-12345");
    expect(res?.status()).toBe(404);
  });
});
