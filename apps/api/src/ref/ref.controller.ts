import { Controller, Get } from '@nestjs/common';
import { KENYA_COUNTIES, ANIMAL_TYPES } from '@wam-mfugo/shared';
import type { ApiResponse, County, AnimalTypeInfo } from '@wam-mfugo/shared';

@Controller('ref')
export class RefController {
  @Get('counties')
  getCounties(): ApiResponse<County[]> {
    return { success: true, data: KENYA_COUNTIES };
  }

  @Get('animal-types')
  getAnimalTypes(): ApiResponse<AnimalTypeInfo[]> {
    return { success: true, data: ANIMAL_TYPES };
  }
}
