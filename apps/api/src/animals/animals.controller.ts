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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { ApiResponse, HealthStatus, Livestock } from '@wam-mfugo/shared';
import { AnimalsService } from './animals.service';
import { AnimalQueryDto } from './dto/animal-query.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { UpdateHealthDto } from './dto/update-health.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { sendCsv, toCsv } from '../common/csv';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('animals')
@ApiBearerAuth('access-token')
@Controller('animals')
@UseGuards(JwtAuthGuard)
export class AnimalsController {
  constructor(
    private readonly animals: AnimalsService,
    private readonly events: EventsGateway,
    private readonly notifications: NotificationsService,
  ) {}

  @Get()
  @ApiQuery({ name: 'type', required: false, example: 'Cattle' })
  @ApiQuery({ name: 'health', required: false, example: 'Healthy' })
  @ApiQuery({ name: 'county', required: false, example: 'Nairobi' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async list(
    @Query() query: AnimalQueryDto,
  ): Promise<ApiResponse<Livestock[]>> {
    const data = await this.animals.list(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return {
      success: true,
      data: data.slice((page - 1) * limit, page * limit),
      total: data.length,
      page,
      limit,
    };
  }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  @ApiQuery({ name: 'type', required: false, example: 'Cattle' })
  @ApiQuery({ name: 'health', required: false, example: 'Healthy' })
  @ApiQuery({ name: 'county', required: false, example: 'Nairobi' })
  async export(
    @Query() query: AnimalQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const data = await this.animals.list(query);
    const rows = data.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      breed: a.breed ?? '',
      health: a.health,
      county: a.county,
      owner: a.owner,
      farmerId: a.farmerId ?? '',
      lat: a.lat,
      lng: a.lng,
      createdAt: a.createdAt ?? '',
    }));
    sendCsv(res, toCsv(rows), 'animals');
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async create(@Body() dto: CreateAnimalDto): Promise<ApiResponse<Livestock>> {
    const data = await this.animals.create(dto);
    this.events.broadcastAnimalEvent({
      type: 'created',
      animal: data as unknown as Record<string, unknown>,
      timestamp: new Date().toISOString(),
    });
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnimalDto,
  ): Promise<ApiResponse<Livestock>> {
    const data = await this.animals.update(id, dto);
    this.events.broadcastAnimalEvent({
      type: 'updated',
      animal: data as unknown as Record<string, unknown>,
      timestamp: new Date().toISOString(),
    });
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    await this.animals.remove(id);
    this.events.broadcastAnimalEvent({
      type: 'deleted',
      animalId: id,
      timestamp: new Date().toISOString(),
    });
    return { success: true, data: null };
  }

  @Patch(':id/health')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async updateHealth(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHealthDto,
  ): Promise<ApiResponse<Livestock | null>> {
    const data = await this.animals.updateHealth(id, dto.health);
    if (!data) {
      return { success: false, error: 'Animal not found', data: null };
    }
    this.events.broadcastAnimalEvent({
      type: 'updated',
      animal: data as unknown as Record<string, unknown>,
      timestamp: new Date().toISOString(),
    });
    if (dto.health === 'Sick') {
      this.events.broadcastHealthAlert({
        animalId: data.id,
        animalName: data.name,
        previousHealth: 'Healthy',
        newHealth: 'Sick',
        county: data.county,
        owner: data.owner,
      });
      void this.notifications.notifyHealthAlert({
        animalId: data.id,
        animalName: data.name,
        county: data.county,
        owner: data.owner,
      });
    }
    return { success: true, data };
  }

  @Post('import')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    if (!file) {
      return {
        success: false,
        error: 'No file uploaded',
        data: { imported: 0, errors: ['No file provided'] },
      };
    }

    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV must have a header row and at least one data row',
        data: { imported: 0, errors: ['Empty CSV'] },
      };
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'type', 'county', 'owner'];
    const missing = requiredHeaders.filter((h) => !header.includes(h));
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing required columns: ${missing.join(', ')}`,
        data: {
          imported: 0,
          errors: [`Missing columns: ${missing.join(', ')}`],
        },
      };
    }

    const errors: string[] = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      header.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      if (!row.name || !row.type || !row.county || !row.owner) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      try {
        await this.animals.create({
          name: row.name,
          type: row.type as Livestock['type'],
          county: row.county,
          owner: row.owner,
          health: (row.health as HealthStatus) || 'Healthy',
          breed: row.breed || undefined,
          lat: row.lat ? parseFloat(row.lat) : 0,
          lng: row.lng ? parseFloat(row.lng) : 0,
        });
        imported++;
      } catch (err) {
        errors.push(
          `Row ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }

    return { success: true, data: { imported, errors } };
  }

  @Post('bulk/health')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async bulkUpdateHealth(
    @Body() body: { ids: number[]; health: string },
  ): Promise<ApiResponse<{ updated: number }>> {
    const result = await this.animals.bulkUpdateHealth(
      body.ids,
      body.health as HealthStatus,
    );
    return { success: true, data: result };
  }

  @Post('bulk/delete')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async bulkDelete(
    @Body() body: { ids: number[] },
  ): Promise<ApiResponse<{ deleted: number }>> {
    const result = await this.animals.bulkDelete(body.ids);
    return { success: true, data: result };
  }

  @Post('bulk/export')
  @UseGuards(RolesGuard)
  @Roles('admin', 'field_agent')
  async bulkExport(
    @Body() body: { ids: number[] },
    @Res() res: Response,
  ): Promise<void> {
    const data = await this.animals.getByIds(body.ids);
    const rows = data.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      breed: a.breed ?? '',
      health: a.health,
      county: a.county,
      owner: a.owner,
      lat: a.lat,
      lng: a.lng,
      createdAt: a.createdAt ?? '',
    }));
    sendCsv(res, toCsv(rows), 'animals-bulk');
  }
}
