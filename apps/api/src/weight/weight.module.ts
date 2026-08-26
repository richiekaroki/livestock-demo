import { Module } from '@nestjs/common';
import { WeightController } from './weight.controller';
import { WeightService } from './weight.service';
import { PrismaService } from '../common/prisma.service';
import { WEIGHT_REPOSITORY } from './weight.repository';
import { InMemoryWeightRepository } from './in-memory-weight.repository';
import { PrismaWeightRepository } from './prisma-weight.repository';

@Module({
  controllers: [WeightController],
  providers: [
    WeightService,
    {
      provide: WEIGHT_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaWeightRepository(new PrismaService());
        }
        return new InMemoryWeightRepository();
      },
    },
  ],
  exports: [WeightService],
})
export class WeightModule {}
