/**
 * Unit tests for ComputeCB
 */

import {
  computeCB,
  computeCBForYear,
  computeCBBatch,
  ComplianceBalanceInput,
} from '../../src/core/application/ComputeCB';
import { GHG_TARGET_2025 } from '../../src/core/constants/fuelEU';
import { ValidationError } from '../../src/core/shared/errors';

describe('ComputeCB', () => {
  describe('computeCB', () => {
    it('should compute positive CB when actual < target (surplus)', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 89.3368,
        ghgActual: 80.0,
        energyInScope: 1000000, // 1M MJ
      };

      const result = computeCB(input);

      // CB = (89.3368 - 80.0) × 1,000,000 = 9,336,800 gCO2e
      expect(result.complianceBalance).toBeCloseTo(9336800, 2);
      expect(result.isCompliant).toBe(true);
      expect(result.status).toBe('SURPLUS');
      expect(result.ghgTarget).toBe(89.3368);
      expect(result.ghgActual).toBe(80.0);
      expect(result.energyInScope).toBe(1000000);
    });

    it('should compute negative CB when actual > target (deficit)', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 89.3368,
        ghgActual: 95.0,
        energyInScope: 1000000,
      };

      const result = computeCB(input);

      // CB = (89.3368 - 95.0) × 1,000,000 = -5,663,200 gCO2e
      expect(result.complianceBalance).toBeCloseTo(-5663200, 2);
      expect(result.isCompliant).toBe(false);
      expect(result.status).toBe('DEFICIT');
    });

    it('should compute zero CB when actual equals target', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 89.3368,
        ghgActual: 89.3368,
        energyInScope: 1000000,
      };

      const result = computeCB(input);

      expect(result.complianceBalance).toBeCloseTo(0, 2);
      expect(result.isCompliant).toBe(true);
      expect(result.status).toBe('NEUTRAL');
    });

    it('should handle small energy values', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 89.3368,
        ghgActual: 85.0,
        energyInScope: 100,
      };

      const result = computeCB(input);

      // CB = (89.3368 - 85.0) × 100 = 433.68 gCO2e
      expect(result.complianceBalance).toBeCloseTo(433.68, 2);
      expect(result.isCompliant).toBe(true);
    });

    it('should handle large energy values', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 89.3368,
        ghgActual: 90.0,
        energyInScope: 10000000000, // 10B MJ
      };

      const result = computeCB(input);

      // CB = (89.3368 - 90.0) × 10,000,000,000 = -6,632,000,000 gCO2e
      expect(result.complianceBalance).toBeCloseTo(-6632000000, 2);
      expect(result.isCompliant).toBe(false);
    });

    it('should throw ValidationError for non-positive ghgTarget', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 0,
        ghgActual: 80.0,
        energyInScope: 1000000,
      };

      expect(() => computeCB(input)).toThrow(ValidationError);
      expect(() => computeCB(input)).toThrow('GHG target must be positive');
    });

    it('should throw ValidationError for negative ghgActual', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 89.3368,
        ghgActual: -10,
        energyInScope: 1000000,
      };

      expect(() => computeCB(input)).toThrow(ValidationError);
      expect(() => computeCB(input)).toThrow('GHG actual cannot be negative');
    });

    it('should throw ValidationError for non-positive energyInScope', () => {
      const input: ComplianceBalanceInput = {
        ghgTarget: 89.3368,
        ghgActual: 80.0,
        energyInScope: 0,
      };

      expect(() => computeCB(input)).toThrow(ValidationError);
      expect(() => computeCB(input)).toThrow('Energy in scope must be positive');
    });
  });

  describe('computeCBForYear', () => {
    it('should use correct target for 2025', () => {
      const result = computeCBForYear(2025, 85.0, 1000000);

      expect(result.ghgTarget).toBe(GHG_TARGET_2025);
      expect(result.complianceBalance).toBeCloseTo(4336800, 2);
    });

    it('should use correct target for 2026', () => {
      const result = computeCBForYear(2026, 85.0, 1000000);

      expect(result.ghgTarget).toBe(87.5);
      expect(result.complianceBalance).toBeCloseTo(2500000, 2);
    });

    it('should use default target for unknown year', () => {
      const result = computeCBForYear(2050, 85.0, 1000000);

      expect(result.ghgTarget).toBe(GHG_TARGET_2025);
    });
  });

  describe('computeCBBatch', () => {
    it('should compute CB for multiple ships', () => {
      const inputs: ComplianceBalanceInput[] = [
        { ghgTarget: 89.3368, ghgActual: 80.0, energyInScope: 1000000 },
        { ghgTarget: 89.3368, ghgActual: 95.0, energyInScope: 1000000 },
        { ghgTarget: 89.3368, ghgActual: 89.3368, energyInScope: 1000000 },
      ];

      const results = computeCBBatch(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].status).toBe('SURPLUS');
      expect(results[1].status).toBe('DEFICIT');
      expect(results[2].status).toBe('NEUTRAL');
    });

    it('should handle empty array', () => {
      const results = computeCBBatch([]);
      expect(results).toHaveLength(0);
    });
  });
});
