import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HealthAssessmentService } from './health-assessment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('health-assessment')
@ApiBearerAuth('access-token')
@Controller('health-assessment')
@UseGuards(JwtAuthGuard)
export class HealthAssessmentController {
  constructor(private readonly assessment: HealthAssessmentService) {}

  @Post()
  assess(@Body() body: { imageUrl: string; animalType: string; animalName?: string; notes?: string }) {
    return this.assessment.assessHealth(body);
  }
}
