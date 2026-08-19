import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      db: process.env.DATABASE_URL ? 'configured' : 'in-memory',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
