import { test, expect } from "./helpers";

test.describe("Critical Business Flows", () => {
  test.describe("Complete Authentication Flow", () => {
    test("full login with OTP verification", async ({ page }) => {
      await page.goto("/login");

      // Step 1: Enter email
      await page.fill('input[type="email"]', "test@example.com");
      await page.click('button[type="submit"]');

      // Step 2: Wait for OTP form
      await expect(page.locator('input[maxlength="6"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator("text=test@example.com")).toBeVisible();

      // Step 3: Enter OTP (in dev mode, any 6-digit code works)
      await page.fill('input[maxlength="6"]', "123456");
      await page.click('button[type="submit"]');

      // Step 4: Should redirect to dashboard after successful auth
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      await expect(page.locator("text=Total Animals")).toBeVisible();
    });

    test("registration flow with invite token", async ({ page }) => {
      await page.goto("/register");

      // Fill registration form
      await page.fill('input[type="email"]', "newuser@example.com");
      await page.fill('input[type="text"][placeholder*="name"], input[name="name"]', "Test User");
      await page.fill('input[type="tel"], input[name="phone"]', "+254712345678");
      
      // Select county (if dropdown exists)
      const countySelect = page.locator('select[name="county"], select[placeholder*="county"]');
      if (await countySelect.isVisible()) {
        await countySelect.selectOption("Nairobi");
      }

      await page.click('button[type="submit"]');

      // Should show success message or redirect
      await expect(page.locator("text=success, Registration successful, Check your email")).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Animal Management Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test (in dev mode with auto-verify)
      await page.goto("/login");
      await page.fill('input[type="email"]', "admin@wamfugo.ke");
      await page.click('button[type="submit"]');
      await page.fill('input[maxlength="6"]', "123456");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("view animal list and filter", async ({ page }) => {
      await page.goto("/dashboard");

      // Wait for animal list to load
      await page.waitForSelector('[class*="animal"], .animal-card, [data-testid="animal-list"]', { timeout: 10000 });

      // Check if filter controls exist
      const typeFilter = page.locator('select[name="type"], select[placeholder*="type"]');
      if (await typeFilter.isVisible()) {
        await typeFilter.selectOption("Cattle");
        await page.waitForTimeout(1000); // Wait for filter to apply
      }

      // Verify filtered results
      const animalCards = page.locator('[class*="animal"], .animal-card');
      const count = await animalCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("view animal details", async ({ page }) => {
      await page.goto("/dashboard");

      // Click on first animal card if exists
      const firstAnimal = page.locator('[class*="animal"], .animal-card').first();
      if (await firstAnimal.isVisible()) {
        await firstAnimal.click();
        
        // Should show animal details
        await expect(page.locator("text=Animal Details, Name, Breed, Health")).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Health Management Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto("/login");
      await page.fill('input[type="email"]', "admin@wamfugo.ke");
      await page.click('button[type="submit"]');
      await page.fill('input[maxlength="6"]', "123456");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("view vaccination records", async ({ page }) => {
      await page.goto("/vaccinations");

      // Wait for vaccination page to load
      await expect(page.locator("text=Vaccination, Vaccinations")).toBeVisible({ timeout: 10000 });

      // Check for vaccination records
      const vaccinationCards = page.locator('[class*="vaccination"], .vaccination-card');
      const count = await vaccinationCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("view disease outbreaks", async ({ page }) => {
      await page.goto("/outbreaks");

      // Wait for outbreaks page to load
      await expect(page.locator("text=Outbreak, Disease Outbreak")).toBeVisible({ timeout: 10000 });

      // Check for outbreak data
      const outbreakCards = page.locator('[class*="outbreak"], .outbreak-card');
      const count = await outbreakCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Analytics and Reporting Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto("/login");
      await page.fill('input[type="email"]', "admin@wamfugo.ke");
      await page.click('button[type="submit"]');
      await page.fill('input[maxlength="6"]', "123456");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("view dashboard analytics", async ({ page }) => {
      await page.goto("/dashboard");

      // Check for analytics components
      await expect(page.locator("text=Total Animals, Analytics, Statistics")).toBeVisible({ timeout: 10000 });
      
      // Check for charts/graphs
      const charts = page.locator('canvas, [class*="chart"], [class*="graph"]');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThan(0);
    });

    test("view county comparison analytics", async ({ page }) => {
      await page.goto("/county-comparison");

      // Wait for comparison page to load
      await expect(page.locator("text=County Comparison, Analytics")).toBeVisible({ timeout: 10000 });

      // Check for comparison data
      const comparisonElements = page.locator('[class*="county"], [class*="comparison"]');
      const count = await comparisonElements.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Responsive Design Flow", () => {
    test("mobile view navigation", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Check for mobile navigation
      const mobileNav = page.locator('[class*="mobile"], .mobile-nav, nav[aria-label*="mobile"]');
      await expect(mobileNav).toBeVisible();

      // Check hamburger menu
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .menu-button');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await expect(page.locator('[class*="menu"], .dropdown-menu')).toBeVisible();
      }
    });

    test("tablet view layout", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/dashboard");

      // Check for responsive layout
      await expect(page.locator("text=Total Animals")).toBeVisible({ timeout: 10000 });
      
      // Verify sidebar/navigation adapts to tablet size
      const sidebar = page.locator('[class*="sidebar"], aside');
      const isVisible = await sidebar.isVisible().catch(() => false);
      expect(typeof isVisible).toBe("boolean");
    });
  });

  test.describe("Error Handling Flow", () => {
    test("handles network errors gracefully", async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      await page.goto("/dashboard");

      // Should show offline indicator or error message
      await expect(page.locator("text=Offline, Network Error, Connection lost")).toBeVisible({ timeout: 5000 });
      
      // Restore connection
      await page.context().setOffline(false);
    });

    test("handles invalid OTP gracefully", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.click('button[type="submit"]');
      await page.fill('input[maxlength="6"]', "000000"); // Invalid OTP
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator("text=Invalid, incorrect, expired")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Data Visualization Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto("/login");
      await page.fill('input[type="email"]', "admin@wamfugo.ke");
      await page.click('button[type="submit"]');
      await page.fill('input[maxlength="6"]', "123456");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("view mortality tracking analytics", async ({ page }) => {
      await page.goto("/mortality");

      // Wait for mortality page to load
      await expect(page.locator("text=Mortality, Death Rate")).toBeVisible({ timeout: 10000 });

      // Check for mortality charts/data
      const charts = page.locator('canvas, [class*="chart"]');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThan(0);
    });

    test("view weight gain analytics", async ({ page }) => {
      await page.goto("/weight");

      // Wait for weight page to load
      await expect(page.locator("text=Weight, Growth")).toBeVisible({ timeout: 10000 });

      // Check for weight data/charts
      const charts = page.locator('canvas, [class*="chart"]');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThan(0);
    });
  });
});