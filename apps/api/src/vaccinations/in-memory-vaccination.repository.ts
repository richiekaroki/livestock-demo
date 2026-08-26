import type {
  VaccinationRecord,
  VaccinationsRepository,
} from './vaccination.repository';

export class InMemoryVaccinationsRepository implements VaccinationsRepository {
  private vaccinations: VaccinationRecord[] = [];
  private nextId = 1;

  async findMany(
    filters: { animalId?: number; type?: string },
    skip: number,
    take: number,
  ): Promise<VaccinationRecord[]> {
    let filtered = this.vaccinations;
    if (filters.animalId)
      filtered = filtered.filter((v) => v.animalId === filters.animalId);
    if (filters.type)
      filtered = filtered.filter((v) => v.type === filters.type);
    return filtered.slice(skip, skip + take);
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    if (!where) return this.vaccinations.length;
    return this.vaccinations.filter((v) => {
      if (where.animalId && v.animalId !== where.animalId) return false;
      if (where.type && v.type !== where.type) return false;
      return true;
    }).length;
  }

  async create(data: {
    type: string;
    date: Date;
    batchNumber: string;
    veterinarian: string;
    nextDueDate: Date | null;
    animalId: number;
  }): Promise<VaccinationRecord> {
    const record: VaccinationRecord = {
      id: this.nextId++,
      type: data.type,
      date: data.date,
      batchNumber: data.batchNumber,
      veterinarian: data.veterinarian,
      nextDueDate: data.nextDueDate,
      animalId: data.animalId,
    };
    this.vaccinations.push(record);
    return record;
  }

  async update(
    id: number,
    data: Record<string, unknown>,
  ): Promise<VaccinationRecord> {
    const record = this.vaccinations.find((v) => v.id === id);
    if (!record) throw new Error('Vaccination not found');
    Object.assign(record, data);
    return record;
  }

  async remove(id: number): Promise<boolean> {
    const index = this.vaccinations.findIndex((v) => v.id === id);
    if (index === -1) return false;
    this.vaccinations.splice(index, 1);
    return true;
  }

  async findDueReminders(
    now: Date,
    deadline: Date,
  ): Promise<VaccinationRecord[]> {
    return this.vaccinations.filter((v) => {
      if (!v.nextDueDate) return false;
      return v.nextDueDate >= now && v.nextDueDate <= deadline;
    });
  }
}
