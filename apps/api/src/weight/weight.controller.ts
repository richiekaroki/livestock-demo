import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecordWeightDto, WeightQueryDto } from './dto/weight.dto';
import { WeightService } from './weight.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('weight')
@ApiBearerAuth('access-token')
@Controller('weight')
@UseGuards(JwtAuthGuard)
export class WeightController {
  constructor(private readonly weight: WeightService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  list(@Query() query: WeightQueryDto) {
    return this.weight.list(query);
  }

  @Get('animal/:animalId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  getAnimalHistory(@Param('animalId', ParseIntPipe) animalId: number) {
    return this.weight.getAnimalHistory(animalId);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  getStats(@Query() query: { county?: string; animalId?: number }) {
    return this.weight.getWeightGainStats(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  record(
    @Body() dto: RecordWeightDto,
    @Req() req: { user: { email: string } },
  ) {
    return this.weight.record({ ...dto, recordedBy: req.user.email });
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.weight.remove(id);
    return { success: true };
  }
}
