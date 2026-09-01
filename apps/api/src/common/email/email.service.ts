import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly provider: string;
  private readonly templatesDir: string;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console';
    this.templatesDir = path.join(__dirname, 'email-templates');
  }

  async sendOtpEmail(
    to: string,
    code: string,
    purpose: 'login' | 'register',
    name?: string,
  ): Promise<void> {
    const templateFile =
      purpose === 'register' ? 'otp-register.html' : 'otp-login.html';
    const expiresIn = process.env.OTP_EXPIRY_MINUTES || '5';

    let html: string;
    try {
      html = fs.readFileSync(
        path.join(this.templatesDir, templateFile),
        'utf-8',
      );
    } catch {
      html = this.getFallbackTemplate(code, purpose, expiresIn, name);
    }

    html = html
      .replace(/\{\{code\}\}/g, code)
      .replace(/\{\{expiresIn\}\}/g, expiresIn)
      .replace(/\{\{name\}\}/g, name || 'there');

    const subject =
      purpose === 'register'
        ? 'Verify Your Wam Mfugo Account'
        : 'Your Wam Mfugo Login Code';

    const options: EmailOptions = { to, subject, html };

    if (this.provider === 'smtp' || this.provider === 'brevo') {
      await this.sendViaSmtp(options);
    } else {
      console.log(`\n[AUTH] OTP for ${to}: ${code}`);
      console.log(`[AUTH] Subject: ${subject}`);
      console.log(`[AUTH] (Demo mode — email not sent)\n`);
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (this.provider === 'smtp' || this.provider === 'brevo') {
      await this.sendViaSmtp(options);
    } else {
      console.log(`\n[EMAIL] To: ${options.to}`);
      console.log(`[EMAIL] Subject: ${options.subject}`);
      console.log(`[EMAIL] (Demo mode — email not sent)\n`);
    }
  }

  async sendInvitationEmail(
    to: string,
    name: string,
    inviteLink: string,
    expiresInHours: number,
  ): Promise<void> {
    let html: string;
    try {
      html = fs.readFileSync(
        path.join(this.templatesDir, 'invitation.html'),
        'utf-8',
      );
    } catch {
      html = this.getInvitationFallbackTemplate(
        name,
        inviteLink,
        expiresInHours,
      );
    }

    html = html
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{inviteLink\}\}/g, inviteLink)
      .replace(/\{\{expiresInHours\}\}/g, String(expiresInHours));

    const options: EmailOptions = {
      to,
      subject: 'Complete Your Wam Mfugo Registration',
      html,
    };

    if (this.provider === 'smtp' || this.provider === 'brevo') {
      await this.sendViaSmtp(options);
    } else {
      console.log(`\n[AUTH] Invitation for ${to}:`);
      console.log(`[AUTH] Link: ${inviteLink}`);
      console.log(`[AUTH] (Demo mode — email not sent)\n`);
    }
  }

  private async sendViaSmtp(options: EmailOptions): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('[EMAIL] BREVO_API_KEY not set — cannot send email');
      return;
    }

    const from = (
      process.env.SMTP_FROM || 'Wam Mfugo <noreply@wamfugo.com>'
    ).replace(/.*<(.+?)>.*/, '$1');

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: from, name: 'Wam Mfugo' },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(
          `[EMAIL] Brevo API ${res.status}: ${body}`,
        );
      } else {
        console.log(`[EMAIL] Sent to ${options.to}`);
      }
    } catch (err) {
      console.error(
        `[EMAIL] Brevo API failed: ${(err as Error).message}`,
      );
    }
  }

  private getFallbackTemplate(
    code: string,
    purpose: string,
    expiresIn: string,
    name?: string,
  ): string {
    const greeting =
      purpose === 'register'
        ? `Welcome to Wam Mfugo, ${name || 'there'}!`
        : `Hello ${name || 'there'},`;

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#16a34a;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">Wam Mfugo</h1>
      <p style="color:#bbf7d0;margin:4px 0 0;font-size:14px;">Livestock Management</p>
    </div>
    <div style="padding:32px 24px;text-align:center;">
      <p style="color:#374151;font-size:16px;margin:0 0 16px;">${greeting}</p>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;">Your verification code is:</p>
      <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:8px;padding:20px;margin:0 0 24px;">
        <span style="font-size:36px;font-weight:bold;color:#16a34a;letter-spacing:8px;">${code}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">This code expires in ${expiresIn} minutes.</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">If you didn't request this, please ignore this email.</p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Wam Mfugo &copy; ${new Date().getFullYear()} &mdash; Livestock Management System</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getInvitationFallbackTemplate(
    name: string,
    inviteLink: string,
    expiresInHours: number,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#16a34a;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">Wam Mfugo</h1>
      <p style="color:#bbf7d0;margin:4px 0 0;font-size:14px;">Livestock Management</p>
    </div>
    <div style="padding:32px 24px;text-align:center;">
      <p style="color:#374151;font-size:16px;margin:0 0 16px;">Hello ${name},</p>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;">Click the button below to complete your registration:</p>
      <a href="${inviteLink}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;margin:0 0 24px;">Complete Registration</a>
      <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">This link expires in ${expiresInHours} hours.</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">If you didn't request this, please ignore this email.</p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Wam Mfugo &copy; ${new Date().getFullYear()} &mdash; Livestock Management System</p>
    </div>
  </div>
</body>
</html>`;
  }
}
