import { Module } from '@nestjs/common';
import { AnimalsModule } from '../animals/animals.module';
import { VaccinationsModule } from '../vaccinations/vaccinations.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PrismaService } from '../common/prisma.service';
import { STATS_REPOSITORY } from './stats.repository';
import { InMemoryStatsRepository } from './in-memory-stats.repository';
import { PrismaStatsRepository } from './prisma-stats.repository';

@Module({
  imports: [AnimalsModule, VaccinationsModule],
  controllers: [StatsController],
  providers: [
    StatsService,
    {
      provide: STATS_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaStatsRepository(new PrismaService());
        }
        return new InMemoryStatsRepository();
      },
    },
  ],
})
export class StatsModule {}
