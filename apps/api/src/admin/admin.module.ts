import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../common/permissions/permissions.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DataRetentionService } from './data-retention.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [AuthModule, PermissionsModule, ScheduleModule.forRoot()],
  controllers: [AdminController],
  providers: [AdminService, DataRetentionService, PrismaService],
})
export class AdminModule {}
