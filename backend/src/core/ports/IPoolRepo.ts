/**
 * Pool Repository Interface
 * Port for data access layer (no implementation here)
 */

import { Pool } from '../domain/Pool';
import { PoolMember } from '../domain/PoolMember';

export interface IPoolRepo {
  /**
   * Find pool by ID
   */
  findById(id: string): Promise<Pool | null>;
  
  /**
   * Find pools by year
   */
  findByYear(year: number): Promise<Pool[]>;
  
  /**
   * Find active pools
   */
  findActive(): Promise<Pool[]>;
  
  /**
   * Save a pool
   */
  save(pool: Pool): Promise<Pool>;
  
  /**
   * Update pool
   */
  update(id: string, data: Partial<Pool>): Promise<Pool>;
  
  /**
   * Delete pool
   */
  delete(id: string): Promise<void>;
  
  /**
   * Find pool members by pool ID
   */
  findMembersByPoolId(poolId: string): Promise<PoolMember[]>;
  
  /**
   * Find pools a ship is member of
   */
  findPoolsByShipId(shipId: string): Promise<Pool[]>;
  
  /**
   * Save a pool member
   */
  saveMember(member: PoolMember): Promise<PoolMember>;
  
  /**
   * Save multiple pool members
   */
  saveMembers(members: PoolMember[]): Promise<PoolMember[]>;
  
  /**
   * Remove member from pool
   */
  removeMember(memberId: string): Promise<void>;
}
