/**
 * Pool Domain Entity
 * Represents a compliance pooling arrangement
 */

import { PoolStatus } from '../shared/types';

export interface Pool {
  /** Unique identifier */
  id: string;
  
  /** Pool name */
  name: string;
  
  /** Year of pooling */
  year: number;
  
  /** Pool status */
  status: PoolStatus;
  
  /** Total initial CB before pooling */
  totalInitialCB: number;
  
  /** Total adjusted CB after pooling */
  totalAdjustedCB: number;
  
  /** Number of member ships */
  memberCount: number;
  
  /** Created timestamp */
  createdAt: Date;
  
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Factory function to create a Pool entity
 */
export function createPool(
  name: string,
  year: number,
  totalInitialCB: number,
  totalAdjustedCB: number,
  memberCount: number
): Pool {
  const status: PoolStatus = totalAdjustedCB >= 0 ? 'ACTIVE' : 'INVALID';
  
  return {
    id: generatePoolId(),
    name,
    year,
    status,
    totalInitialCB,
    totalAdjustedCB,
    memberCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Generate a unique pool ID
 */
function generatePoolId(): string {
  return `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
