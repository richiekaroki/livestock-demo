import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthCheckController {
  constructor(
    @Optional()
    @Inject(PrismaService)
    private readonly prisma?: PrismaService | null,
  ) {}

  @Get()
  async check() {
    const db = await this.pingDb();
    const mem = process.memoryUsage();
    return {
      status: db === 'error' ? 'degraded' : 'ok',
      db,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        rss: Math.round(mem.rss / 1024 / 1024),
      },
      node: process.version,
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
