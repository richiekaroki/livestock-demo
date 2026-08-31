export const VACCINATIONS_REPOSITORY = Symbol('VACCINATIONS_REPOSITORY');

export interface VaccinationRecord {
  id: number;
  type: string;
  date: Date;
  batchNumber: string;
  veterinarian: string;
  nextDueDate: Date | null;
  animalId: number;
  animalName?: string;
  animalType?: string;
  owner?: string;
  county?: string;
}

export interface VaccinationsRepository {
  findMany(
    filters: { animalId?: number; type?: string },
    skip: number,
    take: number,
  ): Promise<VaccinationRecord[]>;
  count(where?: Record<string, unknown>): Promise<number>;
  create(data: {
    type: string;
    date: Date;
    batchNumber: string;
    veterinarian: string;
    nextDueDate: Date | null;
    animalId: number;
  }): Promise<VaccinationRecord>;
  update(id: number, data: Record<string, unknown>): Promise<VaccinationRecord>;
  remove(id: number): Promise<boolean>;
  findDueReminders(now: Date, deadline: Date): Promise<VaccinationRecord[]>;
}
