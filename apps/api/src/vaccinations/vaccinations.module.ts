import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';
import { ReminderService } from './reminder.service';
import { EmailService } from '../common/email/email.service';
import { VACCINATIONS_REPOSITORY } from './vaccination.repository';
import { InMemoryVaccinationsRepository } from './in-memory-vaccination.repository';
import { PrismaVaccinationsRepository } from './prisma-vaccination.repository';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [VaccinationsController],
  providers: [
    VaccinationsService,
    {
      provide: VACCINATIONS_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaVaccinationsRepository(new PrismaService());
        }
        return new InMemoryVaccinationsRepository();
      },
    },
    ReminderService,
    EmailService,
  ],
  exports: [VaccinationsService],
})
export class VaccinationsModule {}
