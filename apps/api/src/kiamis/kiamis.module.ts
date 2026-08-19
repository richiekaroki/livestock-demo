import { Module } from '@nestjs/common';
import { KiamisController } from './kiamis.controller';
import { KiamisService } from './kiamis.service';

@Module({
  controllers: [KiamisController],
  providers: [KiamisService],
})
export class KiamisModule {}
