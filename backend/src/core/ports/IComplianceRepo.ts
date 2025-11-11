/**
 * Compliance Repository Interface
 * Port for data access layer (no implementation here)
 */

import { ShipCompliance } from '../domain/ShipCompliance';

export interface IComplianceRepo {
  /**
   * Find compliance record by ID
   */
  findById(id: string): Promise<ShipCompliance | null>;
  
  /**
   * Find compliance records by ship ID
   */
  findByShipId(shipId: string): Promise<ShipCompliance[]>;
  
  /**
   * Find compliance record for a ship in a specific year
   */
  findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
  
  /**
   * Find all compliance records for a year
   */
  findByYear(year: number): Promise<ShipCompliance[]>;
  
  /**
   * Save compliance record
   */
  save(compliance: ShipCompliance): Promise<ShipCompliance>;
  
  /**
   * Save multiple compliance records
   */
  saveMany(compliances: ShipCompliance[]): Promise<ShipCompliance[]>;
  
  /**
   * Update compliance record
   */
  update(id: string, data: Partial<ShipCompliance>): Promise<ShipCompliance>;
  
  /**
   * Delete compliance record
   */
  delete(id: string): Promise<void>;
}
