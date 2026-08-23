import { Module } from '@nestjs/common';
import { HealthAssessmentService } from './health-assessment.service';
import { HealthAssessmentController } from './health-assessment.controller';

@Module({
  controllers: [HealthAssessmentController],
  providers: [HealthAssessmentService],
  exports: [HealthAssessmentService],
})
export class HealthAssessmentModule {}
