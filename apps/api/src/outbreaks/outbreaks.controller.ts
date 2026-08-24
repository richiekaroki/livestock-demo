import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  OutbreakQueryDto,
  ReportOutbreakDto,
  UpdateOutbreakDto,
} from './dto/report-outbreak.dto';
import { OutbreaksService } from './outbreaks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('outbreaks')
@ApiBearerAuth('access-token')
@Controller('outbreaks')
@UseGuards(JwtAuthGuard)
export class OutbreaksController {
  constructor(
    private readonly outbreaks: OutbreaksService,
    private readonly events: EventsGateway,
    private readonly notifications: NotificationsService,
  ) {}

  @Get()
  list(@Query() query: OutbreakQueryDto) {
    return this.outbreaks.list(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async report(@Body() dto: ReportOutbreakDto) {
    const data = await this.outbreaks.report(dto);
    this.events.broadcastOutbreakEvent(
      'reported',
      data as unknown as Record<string, unknown>,
    );
    void this.notifications.notifyOutbreak({
      id: data.id,
      diseaseType: data.diseaseType,
      county: data.county,
      affectedAnimals: data.affectedAnimals,
    });
    return data;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOutbreakDto,
  ) {
    const data = await this.outbreaks.update(id, dto);
    this.events.broadcastOutbreakEvent(
      'updated',
      data as unknown as Record<string, unknown>,
    );
    return data;
  }
}
