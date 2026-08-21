import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { KENYA_COUNTIES, ANIMAL_TYPES } from '@wam-mfugo/shared';
import type { ApiResponse, County, AnimalTypeInfo } from '@wam-mfugo/shared';
import { PaginatedDto } from '../common/pagination';

function paginate<T>(
  data: T[],
  query: PaginatedDto,
): { data: T[]; total: number; page: number; limit: number } {
  const page = query.page ?? 1;
  const limit = query.limit ?? 0;
  if (!limit) return { data, total: data.length, page: 1, limit: 0 };
  return {
    data: data.slice((page - 1) * limit, page * limit),
    total: data.length,
    page,
    limit,
  };
}

@ApiTags('ref')
@Controller('ref')
export class RefController {
  @Get('counties')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  getCounties(@Query() query: PaginatedDto): ApiResponse<County[]> {
    const { data, total, page, limit } = paginate(KENYA_COUNTIES, query);
    return { success: true, data, total, page, limit };
  }

  @Get('animal-types')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  getAnimalTypes(@Query() query: PaginatedDto): ApiResponse<AnimalTypeInfo[]> {
    const { data, total, page, limit } = paginate(ANIMAL_TYPES, query);
    return { success: true, data, total, page, limit };
  }
}
