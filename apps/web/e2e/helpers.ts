import { test as base, type Page } from "@playwright/test";

export const test = base.extend<{ loginPage: Page }>({
  loginPage: async ({ page }, use) => {
    await page.goto("/login");
    await use(page);
  },
});

export { expect } from "@playwright/test";

/** Fill email and request OTP. Returns the OTP code from console logs (demo mode). */
export async function requestOtp(page: Page, email: string): Promise<string> {
  // Collect console messages to capture the OTP logged by the API
  const otpPromise = new Promise<string>((resolve) => {
    page.on("console", (msg) => {
      const text = msg.text();
      // The API logs: [AUTH] OTP for user@example.com: 123456
      const match = text.match(/OTP for .*?:\s*(\d{6})/);
      if (match) resolve(match[1]);
    });
  });

  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');

  // Wait for OTP step to appear
  await page.waitForSelector('input[maxlength="6"]', { timeout: 10000 });

  return otpPromise;
}

/** Complete the full login flow: email → OTP → dashboard. */
export async function loginAs(
  page: Page,
  email: string = "admin@wamfugo.com"
): Promise<void> {
  const otp = await requestOtp(page, email);
  await page.fill('input[maxlength="6"]', otp);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}
