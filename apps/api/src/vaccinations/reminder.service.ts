import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VaccinationsService } from './vaccinations.service';
import { EmailService } from '../auth/email.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly vaccinations: VaccinationsService,
    private readonly email: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleVaccinationReminders() {
    this.logger.log('Checking for upcoming vaccination reminders...');
    await this.sendReminders(3);
  }

  async sendReminders(daysAhead: number = 3) {
    const due = await this.vaccinations.findDueReminders(daysAhead);

    if (due.length === 0) {
      this.logger.log('No vaccination reminders due.');
      return;
    }

    this.logger.log(`Sending ${due.length} vaccination reminder(s)...`);

    for (const record of due) {
      const dueDate = record.nextDueDate
        ? new Date(record.nextDueDate).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A';

      // Send to the farmer/owner — in production, look up user email by owner
      // For demo, log to console
      this.logger.log(
        `[REMINDER] Vaccination due for ${record.animalName} (${record.animalType}): ${record.type} on ${dueDate}`,
      );
      this.logger.log(
        `[REMINDER] Owner: ${record.owner}, County: ${record.county}`,
      );

      // In production, uncomment to send email:
      // await this.email.sendEmail({
      //   to: ownerEmail,
      //   subject: `Vaccination Reminder: ${record.animalName} - ${record.type}`,
      //   html,
      // });
    }

    this.logger.log(`Processed ${due.length} vaccination reminder(s).`);
  }

  private getReminderTemplate(data: {
    animalName: string;
    animalType: string;
    vaccinationType: string;
    dueDate: string;
    veterinarian: string;
    batchNumber: string;
    owner: string;
    county: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#16a34a;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">Wam Mfugo</h1>
      <p style="color:#bbf7d0;margin:4px 0 0;font-size:14px;">Vaccination Reminder</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="color:#374151;font-size:16px;margin:0 0 16px;">Hello ${data.owner},</p>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;">This is a reminder that a vaccination is due soon for your animal:</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:0 0 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Animal</td>
            <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:bold;">${data.animalName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Type</td>
            <td style="padding:8px 0;color:#1f2937;font-size:14px;">${data.animalType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Vaccination</td>
            <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:bold;">${data.vaccinationType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Due Date</td>
            <td style="padding:8px 0;color:#dc2626;font-size:14px;font-weight:bold;">${data.dueDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Veterinarian</td>
            <td style="padding:8px 0;color:#1f2937;font-size:14px;">${data.veterinarian}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Batch Number</td>
            <td style="padding:8px 0;color:#1f2937;font-size:14px;">${data.batchNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">County</td>
            <td style="padding:8px 0;color:#1f2937;font-size:14px;">${data.county}</td>
          </tr>
        </table>
      </div>

      <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">Please ensure the vaccination is administered before the due date.</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">If you have questions, contact your veterinarian.</p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Wam Mfugo &copy; ${new Date().getFullYear()} &mdash; Livestock Management System</p>
    </div>
  </div>
</body>
</html>`;
  }
}
