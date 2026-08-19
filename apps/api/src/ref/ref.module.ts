import { Module } from '@nestjs/common';
import { RefController } from './ref.controller';

@Module({
  controllers: [RefController],
})
export class RefModule {}
