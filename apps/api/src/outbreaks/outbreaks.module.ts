import { Module } from '@nestjs/common';
import { OutbreaksController } from './outbreaks.controller';
import { OutbreaksService } from './outbreaks.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../common/prisma.service';
import { OUTBREAKS_REPOSITORY } from './outbreaks.repository';
import { InMemoryOutbreaksRepository } from './in-memory-outbreaks.repository';
import { PrismaOutbreaksRepository } from './prisma-outbreaks.repository';

@Module({
  imports: [NotificationsModule],
  controllers: [OutbreaksController],
  providers: [
    OutbreaksService,
    {
      provide: OUTBREAKS_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaOutbreaksRepository(new PrismaService());
        }
        return new InMemoryOutbreaksRepository();
      },
    },
  ],
})
export class OutbreaksModule {}
