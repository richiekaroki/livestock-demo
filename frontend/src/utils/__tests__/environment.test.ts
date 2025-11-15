// src/utils/__tests__/environment.test.ts
import { describe, expect, it } from 'vitest';
import { config, isFeatureEnabled, isValidKenyanNationalId, isValidKenyanPhone } from '../environment';

describe('environment config', () => {
  describe('config', () => {
    it('has correct default values', () => {
      expect(config.isDevelopment).toBe(true);
      expect(config.api.timeout).toBe(10000);
      expect(config.features.offlineMode).toBe(true);
    });

    it('has proper AWS configuration', () => {
      expect(config.aws.region).toBe('af-south-1');
      expect(config.aws.s3.bucket).toBe('mifugo360-biometrics');
    });
  });

  describe('isFeatureEnabled', () => {
    it('returns correct feature status', () => {
      expect(isFeatureEnabled('offlineMode')).toBe(true);
    });
  });

  describe('validation helpers', () => {
    it('validates Kenyan national ID format', () => {
      expect(isValidKenyanNationalId('1234567')).toBe(true);
      expect(isValidKenyanNationalId('12345678')).toBe(true);
      expect(isValidKenyanNationalId('123456')).toBe(false);
      expect(isValidKenyanNationalId('123456789')).toBe(false);
      expect(isValidKenyanNationalId('abc1234')).toBe(false);
    });

    it('validates Kenyan phone number format', () => {
      expect(isValidKenyanPhone('+254712345678')).toBe(true);
      expect(isValidKenyanPhone('+25471234567')).toBe(false); // Too short
      expect(isValidKenyanPhone('0712345678')).toBe(false); // Missing +254
      expect(isValidKenyanPhone('+255712345678')).toBe(false); // Wrong country code
    });
  });
});
