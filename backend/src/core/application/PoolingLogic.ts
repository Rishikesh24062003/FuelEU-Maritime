/**
 * PoolingLogic - Manage compliance pooling arrangements
 * 
 * Pooling Rules:
 * - Sum of adjusted CB across all pool members must be >= 0
 * - Deficit ships cannot exit worse after pooling
 * - Surplus ships cannot exit with negative CB
 * - Greedy allocation: sort ships by CB desc, apply surplus to deficits
 */

import { ValidationError } from '../shared/errors';

export interface PoolMemberInput {
  shipId: string;
  shipName?: string;
  complianceBalance: number;
}

export interface PoolMemberResult {
  shipId: string;
  shipName?: string;
  initialCB: number;
  adjustedCB: number;
  contribution: number; // positive = gave, negative = received
}

export interface PoolingResult {
  members: PoolMemberResult[];
  totalInitialCB: number;
  totalAdjustedCB: number;
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Create a compliance pool using greedy allocation
 */
export function createPool(members: PoolMemberInput[]): PoolingResult {
  validatePoolInput(members);
  
  // Calculate total initial CB
  const totalInitialCB = members.reduce((sum, m) => sum + m.complianceBalance, 0);
  
  // Rule 1: Total CB must be >= 0
  if (totalInitialCB < 0) {
    return {
      members: [],
      totalInitialCB,
      totalAdjustedCB: totalInitialCB,
      isValid: false,
      validationErrors: ['Pool cannot be formed: total CB is negative'],
    };
  }
  
  // Apply greedy allocation
  const result = applyGreedyAllocation(members);
  
  // Validate result
  const validation = validatePoolingResult(result);
  
  return {
    members: result,
    totalInitialCB,
    totalAdjustedCB: result.reduce((sum, m) => sum + m.adjustedCB, 0),
    isValid: validation.isValid,
    validationErrors: validation.errors,
  };
}

/**
 * Apply greedy allocation algorithm
 * 1. Sort ships by CB descending (surplus first)
 * 2. Transfer from surplus ships to deficit ships
 * 3. Ensure no ship exits worse than they entered
 */
function applyGreedyAllocation(members: PoolMemberInput[]): PoolMemberResult[] {
  // Sort by CB descending (surplus ships first)
  const sorted = [...members].sort((a, b) => b.complianceBalance - a.complianceBalance);
  
  // Initialize results with original CB
  const results: PoolMemberResult[] = sorted.map(m => ({
    shipId: m.shipId,
    shipName: m.shipName,
    initialCB: m.complianceBalance,
    adjustedCB: m.complianceBalance,
    contribution: 0,
  }));
  
  // Separate surplus and deficit ships
  const surplusIndices: number[] = [];
  const deficitIndices: number[] = [];
  
  results.forEach((r, idx) => {
    if (r.adjustedCB > 0) {
      surplusIndices.push(idx);
    } else if (r.adjustedCB < 0) {
      deficitIndices.push(idx);
    }
  });
  
  // Transfer from surplus to deficit
  for (const deficitIdx of deficitIndices) {
    const deficit = results[deficitIdx];
    const neededAmount = Math.abs(deficit.adjustedCB);
    let remaining = neededAmount;
    
    for (const surplusIdx of surplusIndices) {
      if (remaining <= 0) break;
      
      const surplus = results[surplusIdx];
      if (surplus.adjustedCB <= 0) continue;
      
      // Transfer amount is minimum of surplus available and deficit needed
      const transferAmount = Math.min(surplus.adjustedCB, remaining);
      
      // Apply transfer
      surplus.adjustedCB -= transferAmount;
      surplus.contribution += transferAmount;
      deficit.adjustedCB += transferAmount;
      deficit.contribution -= transferAmount;
      
      remaining -= transferAmount;
    }
  }
  
  return results;
}

/**
 * Validate pool input
 */
function validatePoolInput(members: PoolMemberInput[]): void {
  if (!members || members.length === 0) {
    throw new ValidationError('Pool must have at least one member');
  }
  
  if (members.length === 1) {
    throw new ValidationError('Pool must have at least two members');
  }
  
  // Validate each member
  members.forEach((m, idx) => {
    if (!m.shipId || m.shipId.trim() === '') {
      throw new ValidationError(`Member ${idx} missing shipId`);
    }
  });
  
  // Check for duplicate ship IDs
  const shipIds = members.map(m => m.shipId);
  const uniqueIds = new Set(shipIds);
  if (uniqueIds.size !== shipIds.length) {
    throw new ValidationError('Duplicate ship IDs in pool');
  }
}

/**
 * Validate pooling result against business rules
 */
function validatePoolingResult(
  results: PoolMemberResult[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Rule 1: Sum of adjusted CB must be >= 0
  const totalAdjustedCB = results.reduce((sum, r) => sum + r.adjustedCB, 0);
  if (totalAdjustedCB < 0) {
    errors.push('Total adjusted CB is negative');
  }
  
  // Rule 2: Deficit ships cannot exit worse
  results.forEach(r => {
    if (r.initialCB < 0 && r.adjustedCB < r.initialCB) {
      errors.push(`Ship ${r.shipId} exits worse than initial (${r.adjustedCB} < ${r.initialCB})`);
    }
  });
  
  // Rule 3: Surplus ships cannot exit with negative CB
  results.forEach(r => {
    if (r.initialCB > 0 && r.adjustedCB < 0) {
      errors.push(`Surplus ship ${r.shipId} exits with negative CB`);
    }
  });
  
  // Rule 4: Total CB must be conserved
  const totalInitialCB = results.reduce((sum, r) => sum + r.initialCB, 0);
  const totalFinalCB = results.reduce((sum, r) => sum + r.adjustedCB, 0);
  const tolerance = 0.001; // Allow small floating point errors
  
  if (Math.abs(totalInitialCB - totalFinalCB) > tolerance) {
    errors.push(`CB not conserved: initial=${totalInitialCB}, final=${totalFinalCB}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a pool can be formed (total CB >= 0)
 */
export function canFormPool(members: PoolMemberInput[]): boolean {
  const totalCB = members.reduce((sum, m) => sum + m.complianceBalance, 0);
  return totalCB >= 0;
}

/**
 * Calculate pool statistics
 */
export function calculatePoolStats(members: PoolMemberInput[]): {
  totalCB: number;
  surplusCount: number;
  deficitCount: number;
  neutralCount: number;
  totalSurplus: number;
  totalDeficit: number;
} {
  let totalCB = 0;
  let surplusCount = 0;
  let deficitCount = 0;
  let neutralCount = 0;
  let totalSurplus = 0;
  let totalDeficit = 0;
  
  members.forEach(m => {
    totalCB += m.complianceBalance;
    
    if (m.complianceBalance > 0) {
      surplusCount++;
      totalSurplus += m.complianceBalance;
    } else if (m.complianceBalance < 0) {
      deficitCount++;
      totalDeficit += Math.abs(m.complianceBalance);
    } else {
      neutralCount++;
    }
  });
  
  return {
    totalCB,
    surplusCount,
    deficitCount,
    neutralCount,
    totalSurplus,
    totalDeficit,
  };
}
