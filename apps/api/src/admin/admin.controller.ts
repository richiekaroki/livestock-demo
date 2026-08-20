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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { ApiResponse, AuditLogEntry } from '@wam-mfugo/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { toCsv } from '../common/csv';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'field_agent', 'farmer'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async listUsers(
    @Query() query: AuditLogQueryDto & { role?: string; isActive?: string; search?: string },
  ) {
    const filters: Record<string, unknown> = {
      role: query.role,
      search: query.search,
      page: query.page,
      limit: query.limit,
    };
    if (query.isActive !== undefined) {
      filters.isActive = query.isActive === 'true';
    }
    const data = await this.adminService.listUsers(filters as any);
    return { success: true, ...data };
  }

  @Get('users/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const data = await this.adminService.getUser(id);
    return { success: true, data };
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const data = await this.adminService.updateUser(id, dto);
    return { success: true, data };
  }

  @Delete('users/:id')
  async deactivateUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number } },
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.adminService.deactivateUser(id, req.user.sub);
    return { success: true, data: result };
  }

  @Post('users/:id/revoke-sessions')
  async revokeSessions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.adminService.revokeSessions(id);
    return { success: true, data: result };
  }

  @Get('audit-logs')
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    const data = await this.adminService.getAuditLogs(query);
    return { success: true, ...data };
  }

  @Get('audit-logs/export')
  @ApiQuery({ name: 'event', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async exportAuditLogs(
    @Query() query: AuditLogQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const data = await this.adminService.getAuditLogs(query);
    const rows = (data.entries ?? []).map((log: AuditLogEntry) => ({
      id: log.id,
      event: log.event,
      email: log.email ?? '',
      userId: log.userId ?? '',
      ip: log.ip ?? '',
      metadata: log.metadata ?? '',
      createdAt: log.createdAt,
    }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send(toCsv(rows));
  }
}
