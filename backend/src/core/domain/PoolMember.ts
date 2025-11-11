/**
 * PoolMember Domain Entity
 * Represents a ship's participation in a compliance pool
 */

export interface PoolMember {
  /** Unique identifier */
  id: string;
  
  /** Pool ID this member belongs to */
  poolId: string;
  
  /** Ship identifier */
  shipId: string;
  
  /** Ship name */
  shipName?: string;
  
  /** Initial CB before pooling */
  initialCB: number;
  
  /** Adjusted CB after pooling */
  adjustedCB: number;
  
  /** CB contribution to pool (positive = gave, negative = received) */
  contribution: number;
  
  /** Whether ship had surplus before pooling */
  hadSurplus: boolean;
  
  /** Joined pool timestamp */
  joinedAt: Date;
}

/**
 * Factory function to create a PoolMember entity
 */
export function createPoolMember(
  poolId: string,
  shipId: string,
  initialCB: number,
  adjustedCB: number,
  shipName?: string
): PoolMember {
  const contribution = initialCB - adjustedCB;
  const hadSurplus = initialCB > 0;
  
  return {
    id: generatePoolMemberId(),
    poolId,
    shipId,
    shipName,
    initialCB,
    adjustedCB,
    contribution,
    hadSurplus,
    joinedAt: new Date(),
  };
}

/**
 * Generate a unique pool member ID
 */
function generatePoolMemberId(): string {
  return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
