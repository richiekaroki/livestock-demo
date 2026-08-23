import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ReportMortalityDto,
  MortalityQueryDto,
} from './dto/mortality.dto';
import { MortalityService } from './mortality.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('mortality')
@ApiBearerAuth('access-token')
@Controller('mortality')
@UseGuards(JwtAuthGuard)
export class MortalityController {
  constructor(private readonly mortality: MortalityService) {}

  @Get()
  list(@Query() query: MortalityQueryDto) {
    return this.mortality.list(query);
  }

  @Get('stats')
  getStats() {
    return this.mortality.getStats();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  report(@Body() dto: ReportMortalityDto) {
    return this.mortality.report(dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mortality.remove(id);
    return { success: true };
  }
}
