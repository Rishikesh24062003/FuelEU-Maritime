/**
 * BankingLogic - Manage compliance balance banking
 * 
 * Banking Rules:
 * - Only positive CB can be banked
 * - Cannot bank negative CB (deficits cannot be banked)
 * - Banked CB can be used in future years to offset deficits
 * - Banked CB from one year can be transferred to another year
 */

import { BankingError, ValidationError } from '../shared/errors';

export interface BankingValidationResult {
  /** Whether banking is allowed */
  canBank: boolean;
  
  /** Reason if banking is not allowed */
  reason?: string;
  
  /** Amount that can be banked */
  bankableAmount: number;
}

export interface BankTransferResult {
  /** Updated source CB after transfer */
  updatedSourceCB: number;
  
  /** Updated target CB after receiving transfer */
  updatedTargetCB: number;
  
  /** Amount transferred */
  transferredAmount: number;
  
  /** Whether transfer was successful */
  success: boolean;
}

/**
 * Validate if a CB amount can be banked
 */
export function validateCanBank(cb: number): BankingValidationResult {
  if (cb <= 0) {
    return {
      canBank: false,
      reason: 'Only positive Compliance Balance can be banked',
      bankableAmount: 0,
    };
  }
  
  return {
    canBank: true,
    bankableAmount: cb,
  };
}

/**
 * Apply banking transaction
 * Reduces source CB and returns the banked amount
 */
export function applyBank(
  sourceCB: number,
  transferAmount: number
): BankTransferResult {
  // Validate source CB is positive
  const validation = validateCanBank(sourceCB);
  if (!validation.canBank) {
    throw new BankingError(validation.reason || 'Cannot bank negative or zero CB');
  }
  
  // Validate transfer amount
  if (transferAmount <= 0) {
    throw new ValidationError('Transfer amount must be positive');
  }
  
  if (transferAmount > sourceCB) {
    throw new BankingError(
      `Transfer amount (${transferAmount}) exceeds available CB (${sourceCB})`
    );
  }
  
  const updatedSourceCB = sourceCB - transferAmount;
  
  return {
    updatedSourceCB,
    updatedTargetCB: 0, // Not receiving yet, just banking
    transferredAmount: transferAmount,
    success: true,
  };
}

/**
 * Apply banked CB to a deficit
 * Transfers banked amount to target year's CB
 */
export function applyBankedToDeficit(
  targetCB: number,
  bankedAmount: number
): BankTransferResult {
  if (bankedAmount <= 0) {
    throw new ValidationError('Banked amount must be positive');
  }
  
  const updatedTargetCB = targetCB + bankedAmount;
  
  return {
    updatedSourceCB: 0, // Already banked, source is depleted
    updatedTargetCB,
    transferredAmount: bankedAmount,
    success: true,
  };
}

/**
 * Transfer CB from surplus to deficit (direct transfer without banking)
 */
export function transferCB(
  sourceCB: number,
  targetCB: number,
  transferAmount: number
): BankTransferResult {
  // Validate source has surplus
  if (sourceCB <= 0) {
    throw new BankingError('Source CB must be positive to transfer');
  }
  
  if (transferAmount <= 0) {
    throw new ValidationError('Transfer amount must be positive');
  }
  
  if (transferAmount > sourceCB) {
    throw new BankingError(
      `Transfer amount (${transferAmount}) exceeds available CB (${sourceCB})`
    );
  }
  
  const updatedSourceCB = sourceCB - transferAmount;
  const updatedTargetCB = targetCB + transferAmount;
  
  return {
    updatedSourceCB,
    updatedTargetCB,
    transferredAmount: transferAmount,
    success: true,
  };
}

/**
 * Calculate maximum amount that can be transferred to make target compliant
 */
export function calculateRequiredTransfer(targetCB: number): number {
  if (targetCB >= 0) {
    return 0; // Already compliant
  }
  
  return Math.abs(targetCB); // Need to transfer deficit amount
}

/**
 * Determine if a ship needs banking support
 */
export function needsBankingSupport(cb: number): boolean {
  return cb < 0;
}

/**
 * Determine if a ship can provide banking support
 */
export function canProvideBankingSupport(cb: number): boolean {
  return cb > 0;
}
