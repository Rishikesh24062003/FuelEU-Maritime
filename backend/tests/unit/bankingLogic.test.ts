/**
 * Unit tests for BankingLogic
 */

import {
  validateCanBank,
  applyBank,
  applyBankedToDeficit,
  transferCB,
  calculateRequiredTransfer,
  needsBankingSupport,
  canProvideBankingSupport,
} from '../../src/core/application/BankingLogic';
import { BankingError, ValidationError } from '../../src/core/shared/errors';

describe('BankingLogic', () => {
  describe('validateCanBank', () => {
    it('should allow banking when CB is positive', () => {
      const result = validateCanBank(1000);

      expect(result.canBank).toBe(true);
      expect(result.bankableAmount).toBe(1000);
      expect(result.reason).toBeUndefined();
    });

    it('should reject banking when CB is zero', () => {
      const result = validateCanBank(0);

      expect(result.canBank).toBe(false);
      expect(result.bankableAmount).toBe(0);
      expect(result.reason).toBe('Only positive Compliance Balance can be banked');
    });

    it('should reject banking when CB is negative', () => {
      const result = validateCanBank(-1000);

      expect(result.canBank).toBe(false);
      expect(result.bankableAmount).toBe(0);
      expect(result.reason).toBe('Only positive Compliance Balance can be banked');
    });
  });

  describe('applyBank', () => {
    it('should reduce source CB when banking positive amount', () => {
      const result = applyBank(1000, 300);

      expect(result.updatedSourceCB).toBe(700);
      expect(result.transferredAmount).toBe(300);
      expect(result.success).toBe(true);
    });

    it('should handle banking entire CB', () => {
      const result = applyBank(1000, 1000);

      expect(result.updatedSourceCB).toBe(0);
      expect(result.transferredAmount).toBe(1000);
      expect(result.success).toBe(true);
    });

    it('should throw BankingError when trying to bank negative CB', () => {
      expect(() => applyBank(-1000, 500)).toThrow(BankingError);
      expect(() => applyBank(-1000, 500)).toThrow('Only positive Compliance Balance can be banked');
    });

    it('should throw BankingError when trying to bank zero CB', () => {
      expect(() => applyBank(0, 100)).toThrow(BankingError);
    });

    it('should throw ValidationError when transfer amount is negative', () => {
      expect(() => applyBank(1000, -100)).toThrow(ValidationError);
      expect(() => applyBank(1000, -100)).toThrow('Transfer amount must be positive');
    });

    it('should throw ValidationError when transfer amount is zero', () => {
      expect(() => applyBank(1000, 0)).toThrow(ValidationError);
    });

    it('should throw BankingError when transfer amount exceeds available CB', () => {
      expect(() => applyBank(1000, 1500)).toThrow(BankingError);
      expect(() => applyBank(1000, 1500)).toThrow('Transfer amount (1500) exceeds available CB (1000)');
    });
  });

  describe('applyBankedToDeficit', () => {
    it('should apply banked CB to reduce deficit', () => {
      const result = applyBankedToDeficit(-500, 300);

      expect(result.updatedTargetCB).toBe(-200);
      expect(result.transferredAmount).toBe(300);
      expect(result.success).toBe(true);
    });

    it('should apply banked CB to eliminate deficit completely', () => {
      const result = applyBankedToDeficit(-500, 500);

      expect(result.updatedTargetCB).toBe(0);
      expect(result.transferredAmount).toBe(500);
    });

    it('should apply banked CB to create surplus', () => {
      const result = applyBankedToDeficit(-500, 800);

      expect(result.updatedTargetCB).toBe(300);
      expect(result.transferredAmount).toBe(800);
    });

    it('should throw ValidationError when banked amount is zero', () => {
      expect(() => applyBankedToDeficit(-500, 0)).toThrow(ValidationError);
      expect(() => applyBankedToDeficit(-500, 0)).toThrow('Banked amount must be positive');
    });

    it('should throw ValidationError when banked amount is negative', () => {
      expect(() => applyBankedToDeficit(-500, -100)).toThrow(ValidationError);
    });
  });

  describe('transferCB', () => {
    it('should transfer CB from surplus to deficit', () => {
      const result = transferCB(1000, -500, 300);

      expect(result.updatedSourceCB).toBe(700);
      expect(result.updatedTargetCB).toBe(-200);
      expect(result.transferredAmount).toBe(300);
      expect(result.success).toBe(true);
    });

    it('should transfer CB from surplus to another surplus', () => {
      const result = transferCB(1000, 200, 300);

      expect(result.updatedSourceCB).toBe(700);
      expect(result.updatedTargetCB).toBe(500);
      expect(result.transferredAmount).toBe(300);
    });

    it('should throw BankingError when source CB is zero', () => {
      expect(() => transferCB(0, -500, 100)).toThrow(BankingError);
      expect(() => transferCB(0, -500, 100)).toThrow('Source CB must be positive to transfer');
    });

    it('should throw BankingError when source CB is negative', () => {
      expect(() => transferCB(-100, -500, 100)).toThrow(BankingError);
    });

    it('should throw ValidationError when transfer amount is zero', () => {
      expect(() => transferCB(1000, -500, 0)).toThrow(ValidationError);
    });

    it('should throw ValidationError when transfer amount is negative', () => {
      expect(() => transferCB(1000, -500, -100)).toThrow(ValidationError);
    });

    it('should throw BankingError when transfer exceeds source CB', () => {
      expect(() => transferCB(1000, -500, 1500)).toThrow(BankingError);
      expect(() => transferCB(1000, -500, 1500)).toThrow('Transfer amount (1500) exceeds available CB (1000)');
    });
  });

  describe('calculateRequiredTransfer', () => {
    it('should return zero for compliant ship', () => {
      expect(calculateRequiredTransfer(100)).toBe(0);
      expect(calculateRequiredTransfer(0)).toBe(0);
    });

    it('should return absolute value of deficit', () => {
      expect(calculateRequiredTransfer(-500)).toBe(500);
      expect(calculateRequiredTransfer(-1000)).toBe(1000);
    });
  });

  describe('needsBankingSupport', () => {
    it('should return true for deficit ships', () => {
      expect(needsBankingSupport(-100)).toBe(true);
      expect(needsBankingSupport(-0.001)).toBe(true);
    });

    it('should return false for compliant ships', () => {
      expect(needsBankingSupport(0)).toBe(false);
      expect(needsBankingSupport(100)).toBe(false);
    });
  });

  describe('canProvideBankingSupport', () => {
    it('should return true for surplus ships', () => {
      expect(canProvideBankingSupport(100)).toBe(true);
      expect(canProvideBankingSupport(0.001)).toBe(true);
    });

    it('should return false for non-surplus ships', () => {
      expect(canProvideBankingSupport(0)).toBe(false);
      expect(canProvideBankingSupport(-100)).toBe(false);
    });
  });
});
