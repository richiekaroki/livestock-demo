import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../auth/permissions.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DataRetentionService } from './data-retention.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AuthModule, PermissionsModule, ScheduleModule.forRoot()],
  controllers: [AdminController],
  providers: [AdminService, DataRetentionService],
})
export class AdminModule {}
