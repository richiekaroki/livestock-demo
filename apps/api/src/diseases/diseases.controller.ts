import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PredictRiskDto, GetRiskDto } from './dto/predict.dto';
import { DiseasesService } from './diseases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('diseases')
@ApiBearerAuth('access-token')
@Controller('diseases')
@UseGuards(JwtAuthGuard)
export class DiseasesController {
  constructor(private readonly diseases: DiseasesService) {}

  @Post('predict/risk')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  predictRisk(@Body() dto: PredictRiskDto) {
    return this.diseases.predictRisk(dto);
  }

  @Get('risk')
  listRisks(@Query() query: GetRiskDto) {
    return this.diseases.getRisks(query);
  }

  @Get('risk/:county')
  getCountyRisk(@Param('county') county: string) {
    return this.diseases.getCountyRiskSummary(county);
  }

  @Post('simulate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  simulateWhatIf(@Body() body: {
    county: string;
    vaccinationIncrease?: number;
    livestockReduction?: number;
    season?: string;
  }) {
    return this.diseases.simulateWhatIf({
      county: body.county,
      vaccinationIncrease: body.vaccinationIncrease,
      livestockReduction: body.livestockReduction,
      season: body.season as any,
    });
  }
}
