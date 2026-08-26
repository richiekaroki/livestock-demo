import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [HealthCheckController],
  providers: [
    {
      provide: PrismaService,
      useFactory: () => (process.env.DATABASE_URL ? new PrismaService() : null),
    },
  ],
})
export class HealthCheckModule {}
