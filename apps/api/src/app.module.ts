import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
})
export class AppModule {}
