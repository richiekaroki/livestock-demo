import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportOutbreakDto } from './dto/report-outbreak.dto';
import { OutbreaksService } from './outbreaks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('outbreaks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'field_agent')
export class OutbreaksController {
  constructor(private readonly outbreaks: OutbreaksService) {}

  @Post()
  report(@Body() dto: ReportOutbreakDto) {
    const data = this.outbreaks.report(dto);
    return { success: true, data };
  }
}
