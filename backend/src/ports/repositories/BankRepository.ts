import { BankEntry } from '../../core/domain/BankEntry';

export interface CreateBankEntryDTO {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface BankTransferResult {
  sourceShipId: string;
  targetShipId: string;
  appliedAmount: number;
  targetNewCB: number;
  sourceRemainingBalance: number;
}

export interface ApplyBankTransferDTO {
  fromShipId: string;
  toShipId: string;
  year: number;
  amount: number;
}

export interface BankRepository {
  getEntries(shipId?: string): Promise<BankEntry[]>;
  getBalance(shipId: string): Promise<number>;
  createEntry(payload: CreateBankEntryDTO): Promise<BankEntry>;
  applyTransfer(payload: ApplyBankTransferDTO): Promise<BankTransferResult>;
}
