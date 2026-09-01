import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ApiResponse, Farmer } from '@wam-mfugo/shared';
import { FarmersService } from './farmers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('farmers')
@UseGuards(JwtAuthGuard)
export class FarmersController {
  constructor(private readonly farmers: FarmersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async list(): Promise<ApiResponse<Farmer[]>> {
    const data = await this.farmers.list();
    return { success: true, data };
  }
}
