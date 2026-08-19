import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';
import { FARMERS_REPOSITORY } from './farmer.repository';
import { InMemoryFarmersRepository } from './in-memory-farmer.repository';
import { PrismaFarmersRepository } from './prisma-farmer.repository';

@Module({
  controllers: [FarmersController],
  providers: [
    FarmersService,
    {
      provide: FARMERS_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaFarmersRepository(new PrismaService());
        }
        return new InMemoryFarmersRepository();
      },
    },
  ],
  exports: [FarmersService],
})
export class FarmersModule {}
