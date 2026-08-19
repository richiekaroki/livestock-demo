import { Injectable } from '@nestjs/common';
import { isValidKenyanNationalId } from '@wam-mfugo/shared';
import type { KIAMISRegistrationResponse } from '@wam-mfugo/shared';
import { RegisterWithKiamisDto } from './dto/register-with-kiamis.dto';

@Injectable()
export class KiamisService {
  register(dto: RegisterWithKiamisDto): Promise<KIAMISRegistrationResponse> {
    if (!isValidKenyanNationalId(dto.ownerNationalID)) {
      return Promise.resolve({
        success: false,
        animalRegistrationNumber: '',
        qrCode: '',
        message: 'Invalid National ID format',
      });
    }

    // Sandbox stub — KIAMIS registration is simulated locally (no public API). Replace with live integration when credentials exist.
    const registrationNumber = `KE-${dto.countyCode}-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    return Promise.resolve({
      success: true,
      animalRegistrationNumber: registrationNumber,
      qrCode: `data:image/svg+xml;base64,${Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg"><text y="20">${registrationNumber}</text></svg>`,
      ).toString('base64')}`,
      message: 'Animal successfully registered with KIAMIS',
      registeredAt: new Date().toISOString(),
      expiryDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ).toISOString(),
    });
  }
}
