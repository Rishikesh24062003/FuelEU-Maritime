/**
 * Shared type definitions for FuelEU Maritime domain
 */

/**
 * Common vessel types
 */
export type VesselType = 
  | 'Container'
  | 'Tanker'
  | 'Bulk Carrier'
  | 'Passenger'
  | 'RoRo'
  | 'General Cargo'
  | 'Other';

/**
 * Fuel types supported
 */
export type FuelType = 
  | 'HFO'
  | 'MDO'
  | 'MGO'
  | 'LNG'
  | 'Methanol'
  | 'Ammonia'
  | 'Hydrogen'
  | 'Other';

/**
 * Compliance status
 */
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';

/**
 * Pool status
 */
export type PoolStatus = 'ACTIVE' | 'CLOSED' | 'INVALID';

/**
 * Banking transaction type
 */
export type BankingTransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
