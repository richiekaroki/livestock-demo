import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ApiResponse, Farmer } from '@wam-mfugo/shared';
import { FarmersService } from './farmers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('farmers')
@UseGuards(JwtAuthGuard)
export class FarmersController {
  constructor(private readonly farmers: FarmersService) {}

  @Get()
  async list(): Promise<ApiResponse<Farmer[]>> {
    const data = await this.farmers.list();
    return { success: true, data };
  }
}
