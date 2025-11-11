/**
 * ComputeCB - Calculate Compliance Balance
 * 
 * Formula: CB = (GHG_target - GHG_actual) × energy_in_scope
 * 
 * Where:
 * - GHG_target: Target GHG intensity in gCO2e/MJ (e.g., 89.3368 for 2025)
 * - GHG_actual: Actual GHG intensity in gCO2e/MJ
 * - energy_in_scope: Total energy consumed in scope in MJ
 * 
 * Result:
 * - CB > 0: Surplus (ship performed better than target)
 * - CB < 0: Deficit (ship performed worse than target)
 * - CB = 0: Exactly at target
 */

import { GHG_TARGET_2025, GHG_TARGETS } from '../constants/fuelEU';
import { ValidationError } from '../shared/errors';

export interface ComplianceBalanceInput {
  /** GHG target intensity in gCO2e/MJ */
  ghgTarget: number;
  
  /** Actual GHG intensity in gCO2e/MJ */
  ghgActual: number;
  
  /** Energy in scope in MJ */
  energyInScope: number;
}

export interface ComplianceBalanceResult {
  /** Compliance Balance in gCO2e */
  complianceBalance: number;
  
  /** GHG target used */
  ghgTarget: number;
  
  /** Actual GHG intensity */
  ghgActual: number;
  
  /** Energy in scope */
  energyInScope: number;
  
  /** Whether the ship is compliant (CB >= 0) */
  isCompliant: boolean;
  
  /** Surplus or deficit indicator */
  status: 'SURPLUS' | 'DEFICIT' | 'NEUTRAL';
}

/**
 * Compute Compliance Balance (CB)
 */
export function computeCB(input: ComplianceBalanceInput): ComplianceBalanceResult {
  validateInput(input);
  
  const { ghgTarget, ghgActual, energyInScope } = input;
  
  // CB = (GHG_target - GHG_actual) × energy_in_scope
  const complianceBalance = (ghgTarget - ghgActual) * energyInScope;
  
  return {
    complianceBalance,
    ghgTarget,
    ghgActual,
    energyInScope,
    isCompliant: complianceBalance >= 0,
    status: determineStatus(complianceBalance),
  };
}

/**
 * Compute CB for a specific year (uses year-specific target)
 */
export function computeCBForYear(
  year: number,
  ghgActual: number,
  energyInScope: number
): ComplianceBalanceResult {
  const ghgTarget = GHG_TARGETS[year] ?? GHG_TARGET_2025;
  
  return computeCB({
    ghgTarget,
    ghgActual,
    energyInScope,
  });
}

/**
 * Validate input parameters
 */
function validateInput(input: ComplianceBalanceInput): void {
  if (input.ghgTarget <= 0) {
    throw new ValidationError('GHG target must be positive');
  }
  
  if (input.ghgActual < 0) {
    throw new ValidationError('GHG actual cannot be negative');
  }
  
  if (input.energyInScope <= 0) {
    throw new ValidationError('Energy in scope must be positive');
  }
}

/**
 * Determine status based on CB value
 */
function determineStatus(complianceBalance: number): 'SURPLUS' | 'DEFICIT' | 'NEUTRAL' {
  if (complianceBalance > 0) {
    return 'SURPLUS';
  } else if (complianceBalance < 0) {
    return 'DEFICIT';
  } else {
    return 'NEUTRAL';
  }
}

/**
 * Batch compute CB for multiple ships
 */
export function computeCBBatch(
  inputs: ComplianceBalanceInput[]
): ComplianceBalanceResult[] {
  return inputs.map(input => computeCB(input));
}
