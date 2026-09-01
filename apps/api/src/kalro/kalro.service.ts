import { Injectable } from '@nestjs/common';
import type { ApiResponse, KALROVeterinaryRecord } from '@wam-mfugo/shared';

@Injectable()
export class KalroService {
  async fetchVeterinaryRecord(
    animalId: string,
  ): Promise<ApiResponse<KALROVeterinaryRecord>> {
    // Sanitize animalId — only allow alphanumeric and hyphens
    const safeId = animalId.replace(/[^a-zA-Z0-9-]/g, '');

    if (process.env.KALRO_API_URL) {
      try {
        const res = await fetch(
          `${process.env.KALRO_API_URL}/veterinary/${safeId}`,
          {
            headers: {
              'X-Client-Id': process.env.KALRO_CLIENT_ID ?? '',
            },
          },
        );
        if (!res.ok) {
          return {
            success: false,
            error: `KALRO request failed (${res.status})`,
            data: {} as KALROVeterinaryRecord,
          };
        }
        return {
          success: true,
          data: (await res.json()) as KALROVeterinaryRecord,
        };
      } catch {
        return {
          success: false,
          error: 'KALRO service unavailable',
          data: {} as KALROVeterinaryRecord,
        };
      }
    }

    // Sandbox stub — KALRO fallback when KALRO_API_URL is unset. Replace with live integration when credentials exist.
    const record: KALROVeterinaryRecord = {
      animalId,
      vaccination: [
        {
          type: 'Foot and Mouth Disease (FMD)',
          date: '2025-01-10',
          batchNumber: 'KALRO-B-2025-0142',
          veterinarian: 'Dr. James Mwangi',
          nextDueDate: '2026-01-10',
        },
      ],
      diseases: [],
      lastInspection: '2025-06-01',
      nextInspectionDue: '2025-12-01',
      inspectionNotes: 'Animal in good condition.',
    };

    return { success: true, data: record };
  }
}
