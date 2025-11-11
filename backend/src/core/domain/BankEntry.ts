/**
 * BankEntry Domain Entity
 * Represents a banking transaction for compliance balance
 */

import { BankingTransactionType } from '../shared/types';

export interface BankEntry {
  /** Unique identifier */
  id: string;
  
  /** Ship identifier */
  shipId: string;
  
  /** Transaction type */
  transactionType: BankingTransactionType;
  
  /** Amount of CB banked/withdrawn (positive or negative) */
  amount: number;
  
  /** Year the CB was generated */
  sourceYear: number;
  
  /** Year the CB is being applied to */
  targetYear?: number;
  
  /** Remaining balance after this transaction */
  remainingBalance: number;
  
  /** Transaction timestamp */
  transactionDate: Date;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Factory function to create a BankEntry
 */
export function createBankEntry(
  shipId: string,
  transactionType: BankingTransactionType,
  amount: number,
  sourceYear: number,
  remainingBalance: number,
  targetYear?: number,
  notes?: string
): BankEntry {
  return {
    id: generateBankEntryId(),
    shipId,
    transactionType,
    amount,
    sourceYear,
    targetYear,
    remainingBalance,
    transactionDate: new Date(),
    notes,
  };
}

/**
 * Generate a unique bank entry ID
 */
function generateBankEntryId(): string {
  return `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
