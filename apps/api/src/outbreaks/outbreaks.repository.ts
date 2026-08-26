import type { OutbreakRecord } from './outbreaks.service';

export const OUTBREAKS_REPOSITORY = Symbol('OUTBREAKS_REPOSITORY');

export interface OutbreaksRepository {
  report(data: {
    diseaseType: string;
    affectedAnimals: number;
    suspectedAnimals: number;
    lat: number;
    lng: number;
    county: string;
    reportedBy: string;
    symptoms: string[];
    actions: string[];
    status: string;
  }): Promise<OutbreakRecord>;
  findMany(filters: {
    status?: string;
    county?: string;
    diseaseType?: string;
  }, skip: number, take: number): Promise<OutbreakRecord[]>;
  update(id: number, data: Record<string, unknown>): Promise<OutbreakRecord>;
}
