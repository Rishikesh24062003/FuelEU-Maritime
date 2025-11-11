import { CalculationService, FuelRecord } from '../../src/core/application/CalculationService';

describe('CalculationService', () => {
  const service = new CalculationService();

  describe('calcEnergyMJ', () => {
    it('converts fuel tons to MJ using 41,000 MJ/t', () => {
      expect(service.calcEnergyMJ(2)).toBe(82000);
    });

    it('throws on negative input', () => {
      expect(() => service.calcEnergyMJ(-1)).toThrow('fuelTons must be a non-negative number');
    });
  });

  describe('calcTtW', () => {
    it('computes Tank-to-Wake emissions using Annex II factors', () => {
      const record: FuelRecord = { fuelType: 'HFO', fuelTons: 10 };
      const result = service.calcTtW(record);

      const expectedEnergy = 10 * 1_000_000 * 0.0405;
      const expectedIntensity = 77.4 + 0 + 0.006 * 298;

      expect(result.energyMJ).toBeCloseTo(expectedEnergy, 5);
      expect(result.intensity).toBeCloseTo(expectedIntensity, 5);
      expect(result.total).toBeCloseTo(expectedIntensity * expectedEnergy, 2);
    });

    it('respects methane slip override', () => {
      const record: FuelRecord = {
        fuelType: 'LNG',
        fuelTons: 1,
        methaneSlipFraction: 0.05,
      };

      const result = service.calcTtW(record);
      const expectedEnergy = 1 * 1_000_000 * 0.0495;
      const expectedIntensity = 56.1 + 0.21 * 0.05 * 25 + 0.001 * 298;

      expect(result.energyMJ).toBeCloseTo(expectedEnergy, 5);
      expect(result.intensity).toBeCloseTo(expectedIntensity, 5);
    });
  });

  describe('calcWtT', () => {
    it('returns upstream emissions intensity and total', () => {
      const record: FuelRecord = { fuelType: 'HFO', fuelTons: 5 };
      const result = service.calcWtT(record);

      const expectedEnergy = 5 * 1_000_000 * 0.0405;
      const expectedIntensity = 13.5;

      expect(result.energyMJ).toBeCloseTo(expectedEnergy, 5);
      expect(result.intensity).toBeCloseTo(expectedIntensity, 5);
      expect(result.total).toBeCloseTo(expectedIntensity * expectedEnergy, 2);
    });
  });

  describe('calcGHGIntensity', () => {
    it('aggregates weighted intensities with wind factor', () => {
      const records: FuelRecord[] = [
        { fuelType: 'HFO', fuelTons: 4 },
        { fuelType: 'LNG', fuelTons: 2, methaneSlipFraction: 0.02 },
      ];

      const intensity = service.calcGHGIntensity(records, 0.95);

      expect(intensity).toBeGreaterThan(0);
      const withoutWind = service.calcGHGIntensity(records);
      expect(intensity).toBeCloseTo(withoutWind * 0.95, 5);
    });

    it('throws for empty records', () => {
      expect(() => service.calcGHGIntensity([])).toThrow('records must be a non-empty array');
    });
  });

  describe('calcComplianceBalance', () => {
    it('applies Annex IV formula', () => {
      const cb = service.calcComplianceBalance(89.3368, 85, 40400);
      expect(cb).toBeCloseTo((89.3368 - 85) * 40400, 2);
    });
  });

  describe('calcPercentDiff', () => {
    it('calculates percentage difference', () => {
      const diff = service.calcPercentDiff(80, 100);
      expect(diff).toBeCloseTo(-20);
    });
  });
});
