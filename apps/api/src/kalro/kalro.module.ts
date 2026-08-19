import { Module } from '@nestjs/common';
import { KalroController } from './kalro.controller';
import { KalroService } from './kalro.service';

@Module({
  controllers: [KalroController],
  providers: [KalroService],
})
export class KalroModule {}
