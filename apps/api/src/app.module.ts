import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AnimalsModule } from './animals/animals.module';
import { StatsModule } from './stats/stats.module';
import { KalroModule } from './kalro/kalro.module';
import { KiamisModule } from './kiamis/kiamis.module';
import { OutbreaksModule } from './outbreaks/outbreaks.module';
import { HealthModule } from './health/health.module';
import { RefModule } from './ref/ref.module';
import { FarmersModule } from './farmers/farmers.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    EventsModule,
    AuthModule,
    AdminModule,
    AnimalsModule,
    StatsModule,
    KalroModule,
    KiamisModule,
    OutbreaksModule,
    HealthModule,
    RefModule,
    FarmersModule,
    VaccinationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
