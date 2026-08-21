import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: PrismaService,
      useFactory: () => (process.env.DATABASE_URL ? new PrismaService() : null),
    },
  ],
})
export class HealthModule {}
