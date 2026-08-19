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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AnimalsModule,
    StatsModule,
    KalroModule,
    KiamisModule,
    OutbreaksModule,
    HealthModule,
    RefModule,
    FarmersModule,
  ],
})
export class AppModule {}
