import { type Page } from "@playwright/test";

export { test, expect } from "@playwright/test";

/** Fill email and request OTP. Returns the OTP code from console logs (demo mode). */
export async function requestOtp(page: Page, email: string): Promise<string> {
  const otpPromise = new Promise<string>((resolve) => {
    page.on("console", (msg) => {
      const text = msg.text();
      const match = text.match(/OTP for .*?:\s*(\d{6})/);
      if (match) resolve(match[1]);
    });
  });

  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  await page.waitForSelector('input[maxlength="6"]', { timeout: 10000 });

  return otpPromise;
}

/** Complete the full login flow: email → OTP → dashboard. */
export async function loginAs(
  page: Page,
  email = "admin@wamfugo.com"
): Promise<void> {
  const otp = await requestOtp(page, email);
  await page.fill('input[maxlength="6"]', otp);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}
