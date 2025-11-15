// src/utils/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateLivestock } from '../validation';
import type { Livestock } from '../../types';

describe('validation', () => {
  describe('validateLivestock', () => {
    it('returns no errors for valid animal data', () => {
      const validAnimal: Partial<Livestock> = {
        name: 'Test Cow',
        type: 'Cattle',
        health: 'Healthy',
        county: 'Nakuru',
        owner: 'John Doe'
      };

      const errors = validateLivestock(validAnimal);
      expect(errors).toHaveLength(0);
    });

    it('detects missing required fields', () => {
      const invalidAnimal: Partial<Livestock> = {
        name: '',
        // Omit type, health, county, owner to test missing fields
      };

      const errors = validateLivestock(invalidAnimal);
      expect(errors).toContain('Name is required');
      expect(errors).toContain('Type is required');
      expect(errors).toContain('Health status is required');
      expect(errors).toContain('County is required');
      expect(errors).toContain('Owner is required');
    });

    it('validates name length', () => {
      const shortNameAnimal: Partial<Livestock> = { name: 'A' };
      const errors = validateLivestock(shortNameAnimal);
      expect(errors).toContain('Name must be at least 2 characters');
    });

    it('handles undefined fields correctly', () => {
      const partialAnimal: Partial<Livestock> = { 
        name: 'Test Cow',
        // type, health, county, owner are undefined
      };
      
      const errors = validateLivestock(partialAnimal);
      
      expect(errors).not.toContain('Name is required');
      expect(errors).toContain('Type is required');
      expect(errors).toContain('Health status is required');
      expect(errors).toContain('County is required');
      expect(errors).toContain('Owner is required');
    });

    it('accepts valid animal types', () => {
      const validTypes: Livestock['type'][] = ['Cattle', 'Goat', 'Sheep', 'Camel', 'Pig', 'Chicken'];
      
      validTypes.forEach(type => {
        const animal: Partial<Livestock> = {
          name: 'Test Animal',
          type: type,
          health: 'Healthy',
          county: 'Nakuru',
          owner: 'Test Owner'
        };
        
        const errors = validateLivestock(animal);
        expect(errors).not.toContain('Type is required');
      });
    });

    it('accepts valid health statuses', () => {
      const validHealth: Livestock['health'][] = ['Healthy', 'Sick', 'Under Treatment', 'Recovered'];
      
      validHealth.forEach(health => {
        const animal: Partial<Livestock> = {
          name: 'Test Animal',
          type: 'Cattle',
          health: health,
          county: 'Nakuru',
          owner: 'Test Owner'
        };
        
        const errors = validateLivestock(animal);
        expect(errors).not.toContain('Health status is required');
      });
    });
  });
});
