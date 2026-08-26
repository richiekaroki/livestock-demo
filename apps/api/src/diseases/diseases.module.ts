import { Module } from '@nestjs/common';
import { DiseasesController } from './diseases.controller';
import { DiseasesService } from './diseases.service';
import { PrismaService } from '../common/prisma.service';
import { DISEASES_REPOSITORY } from './disease.repository';
import { InMemoryDiseasesRepository } from './in-memory-disease.repository';
import { PrismaDiseasesRepository } from './prisma-disease.repository';

@Module({
  controllers: [DiseasesController],
  providers: [
    DiseasesService,
    {
      provide: DISEASES_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaDiseasesRepository(new PrismaService());
        }
        return new InMemoryDiseasesRepository();
      },
    },
  ],
  exports: [DiseasesService],
})
export class DiseasesModule {}
