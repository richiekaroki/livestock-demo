import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('register')
  async register(
    @CurrentUser() user: { sub: number },
    @Body() body: { token: string },
  ): Promise<{ success: boolean }> {
    await this.notifications.registerPushToken(user.sub, body.token);
    return { success: true };
  }

  @Delete('register')
  async unregister(
    @Body() body: { token: string },
  ): Promise<{ success: boolean }> {
    await this.notifications.removePushToken(body.token);
    return { success: true };
  }
}
