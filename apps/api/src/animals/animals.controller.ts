import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { ApiResponse, Livestock } from '@wam-mfugo/shared';
import { AnimalsService } from './animals.service';
import { AnimalQueryDto } from './dto/animal-query.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateHealthDto } from './dto/update-health.dto';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animals: AnimalsService) {}

  @Get()
  async list(
    @Query() query: AnimalQueryDto,
  ): Promise<ApiResponse<Livestock[]>> {
    const data = await this.animals.list(query);
    return { success: true, data, total: data.length, page: 1, limit: 50 };
  }

  @Post()
  async create(@Body() dto: CreateAnimalDto): Promise<ApiResponse<Livestock>> {
    const data = await this.animals.create(dto);
    return { success: true, data };
  }

  @Patch(':id/health')
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
