import { KiamisService } from './kiamis.service';
import type { RegisterWithKiamisDto } from './dto/register-with-kiamis.dto';

describe('KiamisService', () => {
  let service: KiamisService;
  const base: RegisterWithKiamisDto = {
    animalType: 'Cattle',
    ownerNationalID: '1234567',
    countyCode: '012',
    subCountyCode: '01',
    wardCode: '01',
    biometricHash: 'abc',
    gpsCoordinates: { lat: -0.28, lng: 36.08 },
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    service = new KiamisService();
  });

  it('registers a valid animal', async () => {
    const res = await service.register(base);
    expect(res.success).toBe(true);
    expect(res.animalRegistrationNumber).toMatch(/^KE-/);
  });

  it('rejects an invalid national ID', async () => {
    const res = await service.register({ ...base, ownerNationalID: 'ABC' });
    expect(res.success).toBe(false);
    expect(res.animalRegistrationNumber).toBe('');
  });
});
