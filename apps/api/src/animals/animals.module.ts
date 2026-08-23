import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { ANIMALS_REPOSITORY } from './animal.repository';
import { InMemoryAnimalsRepository } from './in-memory-animal.repository';
import { PrismaAnimalsRepository } from './prisma-animal.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AnimalsController],
  providers: [
    AnimalsService,
    {
      provide: ANIMALS_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaAnimalsRepository(new PrismaService());
        }
        return new InMemoryAnimalsRepository();
      },
    },
  ],
  exports: [AnimalsService],
})
export class AnimalsModule {}
