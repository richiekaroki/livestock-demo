import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VaccinationsService } from './vaccinations.service';
import { ReminderService } from './reminder.service';
import {
  CreateVaccinationDto,
  UpdateVaccinationDto,
  VaccinationQueryDto,
} from './dto/vaccination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EventsGateway } from '../events/events.gateway';

@ApiTags('vaccinations')
@ApiBearerAuth('access-token')
@Controller('vaccinations')
@UseGuards(JwtAuthGuard)
export class VaccinationsController {
  constructor(
    private readonly vaccinations: VaccinationsService,
    private readonly reminder: ReminderService,
    private readonly events: EventsGateway,
  ) {}

  @Get()
  list(@Query() query: VaccinationQueryDto) {
    return this.vaccinations.list(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async create(@Body() dto: CreateVaccinationDto) {
    const data = await this.vaccinations.create(dto);
    this.events.broadcastVaccinationEvent(
      'created',
      data as unknown as Record<string, unknown>,
    );
    return data;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVaccinationDto,
  ) {
    const data = await this.vaccinations.update(id, dto);
    if (data) {
      this.events.broadcastVaccinationEvent(
        'updated',
        data as unknown as Record<string, unknown>,
      );
    }
    return data;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.vaccinations.remove(id);
    this.events.broadcastVaccinationEvent('deleted', { id });
    return { success: true };
  }

  @Get('reminders')
  getReminders(@Query('daysAhead') daysAhead?: string) {
    const days = daysAhead ? parseInt(daysAhead, 10) : 3;
    return this.vaccinations.findDueReminders(days);
  }

  @Post('reminders/send')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async triggerReminders(@Query('daysAhead') daysAhead?: string) {
    const days = daysAhead ? parseInt(daysAhead, 10) : 3;
    await this.reminder.sendReminders(days);
    return { success: true, message: 'Reminders sent' };
  }
}
