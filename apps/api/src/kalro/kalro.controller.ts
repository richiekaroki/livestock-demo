import { Controller, Get, Param } from '@nestjs/common';
import { KalroService } from './kalro.service';

@Controller('kalro')
export class KalroController {
  constructor(private readonly kalro: KalroService) {}

  @Get('veterinary/:animalId')
  veterinary(@Param('animalId') animalId: string) {
    return this.kalro.fetchVeterinaryRecord(animalId);
  }
}
