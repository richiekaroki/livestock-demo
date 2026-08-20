import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { KIAMISRegistrationResponse } from '@wam-mfugo/shared';
import { RegisterWithKiamisDto } from './dto/register-with-kiamis.dto';
import { KiamisService } from './kiamis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('kiamis')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class KiamisController {
  constructor(private readonly kiamis: KiamisService) {}

  @Post('register')
  register(
    @Body() dto: RegisterWithKiamisDto,
  ): Promise<KIAMISRegistrationResponse> {
    return this.kiamis.register(dto);
  }
}
