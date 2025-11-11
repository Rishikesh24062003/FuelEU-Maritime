/**
 * Banking Repository Interface
 * Port for data access layer (no implementation here)
 */

import { BankEntry } from '../domain/BankEntry';

export interface IBankingRepo {
  /**
   * Find bank entry by ID
   */
  findById(id: string): Promise<BankEntry | null>;
  
  /**
   * Find all bank entries for a ship
   */
  findByShipId(shipId: string): Promise<BankEntry[]>;
  
  /**
   * Find bank entries by ship and source year
   */
  findByShipAndYear(shipId: string, sourceYear: number): Promise<BankEntry[]>;
  
  /**
   * Get current banked balance for a ship
   */
  getCurrentBalance(shipId: string): Promise<number>;
  
  /**
   * Save a bank entry
   */
  save(entry: BankEntry): Promise<BankEntry>;
  
  /**
   * Save multiple bank entries
   */
  saveMany(entries: BankEntry[]): Promise<BankEntry[]>;
  
  /**
   * Delete a bank entry
   */
  delete(id: string): Promise<void>;
}
