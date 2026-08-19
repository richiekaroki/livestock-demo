import { Body, Controller, Post } from '@nestjs/common';
import { ReportOutbreakDto } from './dto/report-outbreak.dto';
import { OutbreaksService } from './outbreaks.service';

@Controller('outbreaks')
export class OutbreaksController {
  constructor(private readonly outbreaks: OutbreaksService) {}

  @Post()
  report(@Body() dto: ReportOutbreakDto) {
    const data = this.outbreaks.report(dto);
    return { success: true, data };
  }
}
