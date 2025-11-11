/**
 * Unit tests for ComputeComparison
 */

import {
  computeComparison,
  computeComparisonBatch,
  areAllCompliant,
  getNonCompliantRoutes,
  getCompliantRoutes,
  ComparisonInput,
} from '../../src/core/application/ComputeComparison';
import { ValidationError } from '../../src/core/shared/errors';

describe('ComputeComparison', () => {
  describe('computeComparison', () => {
    it('should compute correct percent difference when comparison > baseline', () => {
      const input: ComparisonInput = {
        routeId: 'route-1',
        baselineGHG: 100,
        comparisonGHG: 110,
      };

      const result = computeComparison(input);

      // percentDiff = ((110 / 100) - 1) × 100 = 10%
      expect(result.percentDiff).toBeCloseTo(10, 2);
      expect(result.compliant).toBe(false);
      expect(result.absoluteDiff).toBe(10);
    });

    it('should compute correct percent difference when comparison < baseline', () => {
      const input: ComparisonInput = {
        routeId: 'route-2',
        baselineGHG: 100,
        comparisonGHG: 90,
      };

      const result = computeComparison(input);

      // percentDiff = ((90 / 100) - 1) × 100 = -10%
      expect(result.percentDiff).toBeCloseTo(-10, 2);
      expect(result.compliant).toBe(true);
      expect(result.absoluteDiff).toBe(-10);
    });

    it('should compute zero percent difference when comparison equals baseline', () => {
      const input: ComparisonInput = {
        routeId: 'route-3',
        baselineGHG: 100,
        comparisonGHG: 100,
      };

      const result = computeComparison(input);

      expect(result.percentDiff).toBeCloseTo(0, 2);
      expect(result.compliant).toBe(true);
      expect(result.absoluteDiff).toBe(0);
    });

    it('should mark as compliant when comparison <= baseline', () => {
      const input1: ComparisonInput = {
        routeId: 'route-4',
        baselineGHG: 100,
        comparisonGHG: 100,
      };

      const input2: ComparisonInput = {
        routeId: 'route-5',
        baselineGHG: 100,
        comparisonGHG: 95,
      };

      expect(computeComparison(input1).compliant).toBe(true);
      expect(computeComparison(input2).compliant).toBe(true);
    });

    it('should mark as non-compliant when comparison > baseline', () => {
      const input: ComparisonInput = {
        routeId: 'route-6',
        baselineGHG: 100,
        comparisonGHG: 105,
      };

      expect(computeComparison(input).compliant).toBe(false);
    });

    it('should handle decimal values correctly', () => {
      const input: ComparisonInput = {
        routeId: 'route-7',
        baselineGHG: 89.3368,
        comparisonGHG: 85.5,
      };

      const result = computeComparison(input);

      // percentDiff = ((85.5 / 89.3368) - 1) × 100 ≈ -4.29%
      expect(result.percentDiff).toBeCloseTo(-4.29, 2);
      expect(result.compliant).toBe(true);
    });

    it('should throw ValidationError for empty routeId', () => {
      const input: ComparisonInput = {
        routeId: '',
        baselineGHG: 100,
        comparisonGHG: 90,
      };

      expect(() => computeComparison(input)).toThrow(ValidationError);
      expect(() => computeComparison(input)).toThrow('Route ID is required');
    });

    it('should throw ValidationError for non-positive baseline', () => {
      const input: ComparisonInput = {
        routeId: 'route-8',
        baselineGHG: 0,
        comparisonGHG: 90,
      };

      expect(() => computeComparison(input)).toThrow(ValidationError);
      expect(() => computeComparison(input)).toThrow('Baseline GHG must be positive');
    });

    it('should throw ValidationError for negative comparison', () => {
      const input: ComparisonInput = {
        routeId: 'route-9',
        baselineGHG: 100,
        comparisonGHG: -10,
      };

      expect(() => computeComparison(input)).toThrow(ValidationError);
      expect(() => computeComparison(input)).toThrow('Comparison GHG cannot be negative');
    });
  });

  describe('computeComparisonBatch', () => {
    it('should compute comparisons for multiple routes', () => {
      const inputs: ComparisonInput[] = [
        { routeId: 'r1', baselineGHG: 100, comparisonGHG: 90 },
        { routeId: 'r2', baselineGHG: 100, comparisonGHG: 110 },
        { routeId: 'r3', baselineGHG: 100, comparisonGHG: 100 },
      ];

      const results = computeComparisonBatch(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].compliant).toBe(true);
      expect(results[1].compliant).toBe(false);
      expect(results[2].compliant).toBe(true);
    });
  });

  describe('areAllCompliant', () => {
    it('should return true when all routes are compliant', () => {
      const comparisons = [
        { routeId: 'r1', baselineGHG: 100, comparisonGHG: 90, percentDiff: -10, compliant: true, absoluteDiff: -10 },
        { routeId: 'r2', baselineGHG: 100, comparisonGHG: 95, percentDiff: -5, compliant: true, absoluteDiff: -5 },
      ];

      expect(areAllCompliant(comparisons)).toBe(true);
    });

    it('should return false when any route is non-compliant', () => {
      const comparisons = [
        { routeId: 'r1', baselineGHG: 100, comparisonGHG: 90, percentDiff: -10, compliant: true, absoluteDiff: -10 },
        { routeId: 'r2', baselineGHG: 100, comparisonGHG: 110, percentDiff: 10, compliant: false, absoluteDiff: 10 },
      ];

      expect(areAllCompliant(comparisons)).toBe(false);
    });
  });

  describe('getNonCompliantRoutes', () => {
    it('should filter non-compliant routes', () => {
      const comparisons = [
        { routeId: 'r1', baselineGHG: 100, comparisonGHG: 90, percentDiff: -10, compliant: true, absoluteDiff: -10 },
        { routeId: 'r2', baselineGHG: 100, comparisonGHG: 110, percentDiff: 10, compliant: false, absoluteDiff: 10 },
        { routeId: 'r3', baselineGHG: 100, comparisonGHG: 105, percentDiff: 5, compliant: false, absoluteDiff: 5 },
      ];

      const nonCompliant = getNonCompliantRoutes(comparisons);

      expect(nonCompliant).toHaveLength(2);
      expect(nonCompliant[0].routeId).toBe('r2');
      expect(nonCompliant[1].routeId).toBe('r3');
    });
  });

  describe('getCompliantRoutes', () => {
    it('should filter compliant routes', () => {
      const comparisons = [
        { routeId: 'r1', baselineGHG: 100, comparisonGHG: 90, percentDiff: -10, compliant: true, absoluteDiff: -10 },
        { routeId: 'r2', baselineGHG: 100, comparisonGHG: 110, percentDiff: 10, compliant: false, absoluteDiff: 10 },
        { routeId: 'r3', baselineGHG: 100, comparisonGHG: 95, percentDiff: -5, compliant: true, absoluteDiff: -5 },
      ];

      const compliant = getCompliantRoutes(comparisons);

      expect(compliant).toHaveLength(2);
      expect(compliant[0].routeId).toBe('r1');
      expect(compliant[1].routeId).toBe('r3');
    });
  });
});
