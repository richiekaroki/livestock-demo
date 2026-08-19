import type { Farmer } from '@wam-mfugo/shared';
import { PrismaService } from '../common/prisma.service';
import type { FarmersRepository } from './farmer.repository';

export class PrismaFarmersRepository implements FarmersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Farmer[]> {
    const rows = await this.prisma.farmer.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      phone: r.phone,
      county: r.county,
      subCounty: r.subCounty,
    }));
  }
}
