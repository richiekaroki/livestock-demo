import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { ApiResponse, Livestock } from '@wam-mfugo/shared';
import { AnimalsService } from './animals.service';
import { AnimalQueryDto } from './dto/animal-query.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateHealthDto } from './dto/update-health.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { toCsv } from '../common/csv';

@ApiTags('animals')
@ApiBearerAuth('access-token')
@Controller('animals')
@UseGuards(JwtAuthGuard)
export class AnimalsController {
  constructor(private readonly animals: AnimalsService) {}

  @Get()
  @ApiQuery({ name: 'type', required: false, example: 'Cattle' })
  @ApiQuery({ name: 'health', required: false, example: 'Healthy' })
  @ApiQuery({ name: 'county', required: false, example: 'Nairobi' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async list(
    @Query() query: AnimalQueryDto,
  ): Promise<ApiResponse<Livestock[]>> {
    const data = await this.animals.list(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return {
      success: true,
      data: data.slice((page - 1) * limit, page * limit),
      total: data.length,
      page,
      limit,
    };
  }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  @ApiQuery({ name: 'type', required: false, example: 'Cattle' })
  @ApiQuery({ name: 'health', required: false, example: 'Healthy' })
  @ApiQuery({ name: 'county', required: false, example: 'Nairobi' })
  async export(
    @Query() query: AnimalQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const data = await this.animals.list(query);
    const rows = data.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      breed: a.breed ?? '',
      health: a.health,
      county: a.county,
      owner: a.owner,
      farmerId: a.farmerId ?? '',
      lat: a.lat,
      lng: a.lng,
      createdAt: a.createdAt ?? '',
    }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="animals-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send(toCsv(rows));
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async create(@Body() dto: CreateAnimalDto): Promise<ApiResponse<Livestock>> {
    const data = await this.animals.create(dto);
    return { success: true, data };
  }

  @Patch(':id/health')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async updateHealth(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHealthDto,
  ): Promise<ApiResponse<Livestock | null>> {
    const data = await this.animals.updateHealth(id, dto.health);
    if (!data) {
      return { success: false, error: 'Animal not found', data: null };
    }
    return { success: true, data };
  }
}
