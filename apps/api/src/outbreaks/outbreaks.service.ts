import { Injectable } from '@nestjs/common';
import type { DiseaseOutbreakReport } from '@wam-mfugo/shared';
import { ReportOutbreakDto } from './dto/report-outbreak.dto';

@Injectable()
export class OutbreaksService {
  report(dto: ReportOutbreakDto): DiseaseOutbreakReport {
    return {
      diseaseType: dto.diseaseType,
      affectedAnimals: dto.affectedAnimals,
      suspectedAnimals: dto.suspectedAnimals ?? 0,
      location: {
        lat: dto.lat,
        lng: dto.lng,
        county: dto.county,
        subCounty: '',
        ward: '',
      },
      reportedBy: dto.reportedBy,
      reportedAt: new Date().toISOString(),
      symptoms: dto.symptoms ?? [],
      actions: dto.actions ?? [],
      status: (dto.status as DiseaseOutbreakReport['status']) ?? 'reported',
    };
  }
}
