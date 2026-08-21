import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';
import { ReminderService } from './reminder.service';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [VaccinationsController],
  providers: [
    PrismaService,
    VaccinationsService,
    ReminderService,
    EmailService,
  ],
  exports: [VaccinationsService],
})
export class VaccinationsModule {}
