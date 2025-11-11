/**
 * Unit tests for PoolingLogic
 */

import {
  createPool,
  canFormPool,
  calculatePoolStats,
  PoolMemberInput,
} from '../../src/core/application/PoolingLogic';
import { ValidationError } from '../../src/core/shared/errors';

describe('PoolingLogic', () => {
  describe('createPool', () => {
    it('should create valid pool when sum(CB) >= 0', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 1000 },
        { shipId: 'ship2', complianceBalance: -500 },
        { shipId: 'ship3', complianceBalance: -200 },
      ];

      const result = createPool(members);

      expect(result.isValid).toBe(true);
      expect(result.totalInitialCB).toBe(300);
      expect(result.validationErrors).toHaveLength(0);
    });

    it('should fail when sum(adjusted CB) < 0', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 500 },
        { shipId: 'ship2', complianceBalance: -1000 },
      ];

      const result = createPool(members);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    it('should ensure deficit never exits worse', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 1000 },
        { shipId: 'ship2', complianceBalance: -500 },
      ];

      const result = createPool(members);

      const deficitShip = result.members.find(m => m.shipId === 'ship2');
      expect(deficitShip).toBeDefined();
      expect(deficitShip!.adjustedCB).toBeGreaterThanOrEqual(deficitShip!.initialCB);
    });

    it('should apply greedy allocation correctly', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 1000 },
        { shipId: 'ship2', complianceBalance: -300 },
        { shipId: 'ship3', complianceBalance: -200 },
      ];

      const result = createPool(members);

      expect(result.isValid).toBe(true);
      
      const ship2 = result.members.find(m => m.shipId === 'ship2');
      const ship3 = result.members.find(m => m.shipId === 'ship3');
      
      expect(ship2!.adjustedCB).toBeGreaterThanOrEqual(0);
      expect(ship3!.adjustedCB).toBeGreaterThanOrEqual(0);
    });

    it('should throw ValidationError for empty pool', () => {
      expect(() => createPool([])).toThrow(ValidationError);
    });

    it('should throw ValidationError for single member', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 1000 },
      ];

      expect(() => createPool(members)).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate ship IDs', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 1000 },
        { shipId: 'ship1', complianceBalance: -500 },
      ];

      expect(() => createPool(members)).toThrow(ValidationError);
    });
  });

  describe('canFormPool', () => {
    it('should return true when total CB >= 0', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 1000 },
        { shipId: 'ship2', complianceBalance: -500 },
      ];

      expect(canFormPool(members)).toBe(true);
    });

    it('should return false when total CB < 0', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 500 },
        { shipId: 'ship2', complianceBalance: -1000 },
      ];

      expect(canFormPool(members)).toBe(false);
    });
  });

  describe('calculatePoolStats', () => {
    it('should calculate correct pool statistics', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'ship1', complianceBalance: 1000 },
        { shipId: 'ship2', complianceBalance: -500 },
        { shipId: 'ship3', complianceBalance: 300 },
        { shipId: 'ship4', complianceBalance: 0 },
      ];

      const stats = calculatePoolStats(members);

      expect(stats.totalCB).toBe(800);
      expect(stats.surplusCount).toBe(2);
      expect(stats.deficitCount).toBe(1);
      expect(stats.neutralCount).toBe(1);
      expect(stats.totalSurplus).toBe(1300);
      expect(stats.totalDeficit).toBe(500);
    });
  });
});
