import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VaccinationsService } from './vaccinations.service';
import { CreateVaccinationDto, UpdateVaccinationDto, VaccinationQueryDto } from './dto/vaccination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('vaccinations')
@ApiBearerAuth('access-token')
@Controller('vaccinations')
@UseGuards(JwtAuthGuard)
export class VaccinationsController {
  constructor(private readonly vaccinations: VaccinationsService) {}

  @Get()
  list(@Query() query: VaccinationQueryDto) {
    return this.vaccinations.list(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  create(@Body() dto: CreateVaccinationDto) {
    return this.vaccinations.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVaccinationDto) {
    return this.vaccinations.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vaccinations.remove(id);
  }
}
