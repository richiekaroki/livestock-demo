import { Body, Controller, Post } from '@nestjs/common';
import type { KIAMISRegistrationResponse } from '@wam-mfugo/shared';
import { RegisterWithKiamisDto } from './dto/register-with-kiamis.dto';
import { KiamisService } from './kiamis.service';

@Controller('kiamis')
export class KiamisController {
  constructor(private readonly kiamis: KiamisService) {}

  @Post('register')
  register(
    @Body() dto: RegisterWithKiamisDto,
  ): Promise<KIAMISRegistrationResponse> {
    return this.kiamis.register(dto);
  }
}
