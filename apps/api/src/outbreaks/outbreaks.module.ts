import { Module } from '@nestjs/common';
import { OutbreaksController } from './outbreaks.controller';
import { OutbreaksService } from './outbreaks.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [OutbreaksController],
  providers: [OutbreaksService],
})
export class OutbreaksModule {}
