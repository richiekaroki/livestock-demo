import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { KalroService } from './kalro.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('kalro')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class KalroController {
  constructor(private readonly kalro: KalroService) {}

  @Get('veterinary/:animalId')
  veterinary(@Param('animalId') animalId: string) {
    return this.kalro.fetchVeterinaryRecord(animalId);
  }
}
