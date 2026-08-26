import { Module } from '@nestjs/common';
import { MortalityController } from './mortality.controller';
import { MortalityService } from './mortality.service';
import { PrismaService } from '../common/prisma.service';
import { MORTALITY_REPOSITORY } from './mortality.repository';
import { InMemoryMortalityRepository } from './in-memory-mortality.repository';
import { PrismaMortalityRepository } from './prisma-mortality.repository';

@Module({
  controllers: [MortalityController],
  providers: [
    MortalityService,
    {
      provide: MORTALITY_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaMortalityRepository(new PrismaService());
        }
        return new InMemoryMortalityRepository();
      },
    },
  ],
  exports: [MortalityService],
})
export class MortalityModule {}
