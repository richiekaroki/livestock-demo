import { Module } from '@nestjs/common';
import { OutbreaksController } from './outbreaks.controller';
import { OutbreaksService } from './outbreaks.service';

@Module({
  controllers: [OutbreaksController],
  providers: [OutbreaksService],
})
export class OutbreaksModule {}
