import type { $Enums } from '@prisma/client';
import type {
  AnimalStats,
  BiometricData,
  Filters,
  GovernmentRegistration,
  HealthStatus,
  Livestock,
  LivestockFormData,
} from '@wam-mfugo/shared';
import { PrismaService } from '../common/prisma.service';
import type { AnimalsRepository } from './animal.repository';

type AnimalRow = {
  id: number;
  name: string;
  type: string;
  breed: string | null;
  health: string;
  county: string;
  owner: string;
  lat: number;
  lng: number;
  createdAt: Date;
  biometric: string | null;
  govReg: string | null;
  farmerId: number | null;
};

const toDomainHealth = (health: string): HealthStatus =>
  health === 'UNDER_TREATMENT' ? 'Under Treatment' : (health as HealthStatus);

const toPrismaHealth = (health: HealthStatus): $Enums.HealthStatus =>
  health === 'Under Treatment' ? 'UNDER_TREATMENT' : health;

const toDomain = (row: AnimalRow): Livestock => ({
  id: row.id,
  name: row.name,
  type: row.type as Livestock['type'],
  ...(row.breed ? { breed: row.breed } : {}),
  health: toDomainHealth(row.health),
  county: row.county,
  owner: row.owner,
  lat: row.lat,
  lng: row.lng,
  createdAt: row.createdAt.toISOString(),
  ...(row.farmerId != null ? { farmerId: row.farmerId } : {}),
  ...(row.biometric
    ? { biometricData: JSON.parse(row.biometric) as BiometricData }
    : {}),
  ...(row.govReg
    ? {
        governmentRegistration: JSON.parse(
          row.govReg,
        ) as GovernmentRegistration,
      }
    : {}),
});

export class PrismaAnimalsRepository implements AnimalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: Filters): Promise<Livestock[]> {
    const rows = await this.prisma.animal.findMany({
      where: {
        ...(filters.type
          ? { type: filters.type as unknown as $Enums.AnimalType }
          : {}),
        ...(filters.health
          ? { health: toPrismaHealth(filters.health as HealthStatus) }
          : {}),
        ...(filters.county ? { county: filters.county } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toDomain(r as unknown as AnimalRow));
  }

  async create(data: LivestockFormData): Promise<Livestock> {
    const row = await this.prisma.animal.create({
      data: {
        name: data.name,
        type: data.type,
        ...(data.breed ? { breed: data.breed } : {}),
        health: toPrismaHealth(data.health),
        county: data.county,
        owner: data.owner,
        lat: data.lat,
        lng: data.lng,
        ...(data.farmerId != null ? { farmerId: data.farmerId } : {}),
        ...(data.biometricData
          ? { biometric: JSON.stringify(data.biometricData) }
          : {}),
        ...(data.governmentRegistration
          ? { govReg: JSON.stringify(data.governmentRegistration) }
          : {}),
      },
    });
    return toDomain(row);
  }

  async updateHealth(
    id: number,
    health: HealthStatus,
  ): Promise<Livestock | null> {
    const row = await this.prisma.animal
      .update({
        where: { id },
        data: { health: toPrismaHealth(health) },
      })
      .catch(() => null);
    return row ? toDomain(row) : null;
  }

  async getStatistics(): Promise<AnimalStats> {
    const [totalAnimals, groups, countyRows] = await Promise.all([
      this.prisma.animal.count(),
      this.prisma.animal.groupBy({ by: ['health'], _count: { _all: true } }),
      this.prisma.animal.findMany({
        select: { county: true },
        distinct: ['county'],
      }),
    ]);

    const count = (health: string) =>
      groups.find((g) => g.health === health)?._count._all ?? 0;

    return {
      totalAnimals,
      healthyCount: count('Healthy'),
      sickCount: count('Sick'),
      underTreatmentCount: count('UNDER_TREATMENT'),
      recoveredCount: count('Recovered'),
      counties: countyRows.length,
      lastUpdated: new Date().toISOString(),
    };
  }
}
