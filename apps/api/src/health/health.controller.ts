import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Optional()
    @Inject(PrismaService)
    private readonly prisma?: PrismaService | null,
  ) {}

  @Get()
  async check() {
    const db = await this.pingDb();
    return {
      status: db === 'error' ? 'degraded' : 'ok',
      db,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  private async pingDb(): Promise<'ok' | 'in-memory' | 'error'> {
    if (!this.prisma) return 'in-memory';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }
}
