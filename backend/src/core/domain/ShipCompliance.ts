/**
 * ShipCompliance Domain Entity
 * Represents compliance data for a ship
 */

import { ComplianceStatus } from '../shared/types';

export interface ShipCompliance {
  /** Unique identifier */
  id: string;
  
  /** Ship identifier (IMO number or similar) */
  shipId: string;
  
  /** Ship name */
  shipName?: string;
  
  /** Year of compliance assessment */
  year: number;
  
  /** GHG target intensity in gCO2e/MJ */
  ghgTarget: number;
  
  /** Actual GHG intensity in gCO2e/MJ */
  ghgActual: number;
  
  /** Energy in scope in MJ */
  energyInScope: number;
  
  /** Compliance Balance (CB) in gCO2e */
  complianceBalance: number;
  
  /** Compliance status */
  status: ComplianceStatus;
  
  /** Timestamp of calculation */
  calculatedAt?: Date;
}

/**
 * Factory function to create a ShipCompliance entity
 */
export function createShipCompliance(
  shipId: string,
  year: number,
  ghgTarget: number,
  ghgActual: number,
  energyInScope: number,
  complianceBalance: number
): ShipCompliance {
  return {
    id: generateComplianceId(),
    shipId,
    year,
    ghgTarget,
    ghgActual,
    energyInScope,
    complianceBalance,
    status: determineStatus(complianceBalance),
    calculatedAt: new Date(),
  };
}

/**
 * Determine compliance status based on CB
 */
function determineStatus(complianceBalance: number): ComplianceStatus {
  if (complianceBalance >= 0) {
    return 'COMPLIANT';
  }
  return 'NON_COMPLIANT';
}

/**
 * Generate a unique compliance ID
 */
function generateComplianceId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
