import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerPushToken(userId: number, token: string): Promise<void> {
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { token, userId },
    });
    this.logger.log(`Push token registered for user ${userId}`);
  }

  async removePushToken(token: string, userId: number): Promise<void> {
    await this.prisma.pushToken.deleteMany({
      where: { token, userId },
    });
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: token,
          sound: 'default',
          title,
          body,
          data: data ?? {},
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.error(`Expo push failed: ${response.status} ${text}`);
      }
    } catch (err) {
      this.logger.error('Failed to send push notification', err);
    }
  }

  async notifyHealthAlert(alert: {
    animalId: number;
    animalName: string;
    county: string;
    owner: string;
  }): Promise<void> {
    const tokens = await this.prisma.pushToken.findMany();
    if (tokens.length === 0) return;

    const title = 'Health Alert';
    const body = `Animal "${alert.animalName}" in ${alert.county} has been marked as Sick.`;

    await Promise.all(
      tokens.map((t: any) =>
        this.sendPushNotification(t.token, title, body, {
          type: 'health_alert',
          animalId: alert.animalId,
        }),
      ),
    );
  }

  async notifyOutbreak(outbreak: {
    id: number;
    diseaseType: string;
    county: string;
    affectedAnimals: number;
  }): Promise<void> {
    const tokens = await this.prisma.pushToken.findMany();
    if (tokens.length === 0) return;

    const title = 'Outbreak Reported';
    const body = `${outbreak.diseaseType} outbreak in ${outbreak.county} — ${outbreak.affectedAnimals} animal(s) affected.`;

    await Promise.all(
      tokens.map((t: any) =>
        this.sendPushNotification(t.token, title, body, {
          type: 'outbreak',
          outbreakId: outbreak.id,
        }),
      ),
    );
  }
}
