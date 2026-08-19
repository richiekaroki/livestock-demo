import { Module } from '@nestjs/common';
import { AnimalsModule } from '../animals/animals.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [AnimalsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
