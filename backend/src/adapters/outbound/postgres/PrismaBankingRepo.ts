/**
 * Prisma Repository Implementation for Banking
 * Adapts Prisma to IBankingRepo port interface
 */

import { BankEntry as PrismaBankEntryModel, Prisma, PrismaClient } from '@prisma/client';
import { BankEntry } from '../../../core/domain/BankEntry';
import {
  BankRepository,
  CreateBankEntryDTO,
  ApplyBankTransferDTO,
  BankTransferResult,
} from '../../../ports/repositories/BankRepository';

export class PrismaBankingRepo implements BankRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getEntries(shipId?: string): Promise<BankEntry[]> {
    const entries = await this.prisma.bankEntry.findMany({
      where: shipId ? { shipId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => this.toDomain(entry));
  }

  async getBalance(shipId: string): Promise<number> {
    const entries = await this.prisma.bankEntry.findMany({
      where: { shipId },
    });

    return entries.reduce<number>((sum, entry) => sum + entry.amountGco2eq, 0);
  }

  async createEntry(payload: CreateBankEntryDTO): Promise<BankEntry> {
    const created = await this.prisma.bankEntry.create({
      data: {
        shipId: payload.shipId,
        year: payload.year,
        amountGco2eq: payload.amountGco2eq,
      },
    });

    return this.toDomain(created);
  }

  async applyTransfer(payload: ApplyBankTransferDTO): Promise<BankTransferResult> {
    const { fromShipId, toShipId, year, amount } = payload;

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const sourceEntries = await tx.bankEntry.findMany({
        where: { shipId: fromShipId },
      });
      const sourceBalance = sourceEntries.reduce<number>((sum, entry) => sum + entry.amountGco2eq, 0);

      if (sourceBalance < amount) {
        throw new Error(
          `Insufficient banked CB. Available: ${sourceBalance}, Requested: ${amount}`
        );
      }

      const targetCompliance = await tx.shipCompliance.findFirst({
        where: {
          shipId: toShipId,
          year,
        },
        orderBy: { recordedAt: 'desc' },
      });

      if (!targetCompliance) {
        throw new Error(
          `No compliance record found for target ship ${toShipId} in year ${year}`
        );
      }

      const { applyBankedToDeficit } = await import('../../../core/application/BankingLogic');
      const applyResult = applyBankedToDeficit(targetCompliance.cbGco2eq, amount);

      await tx.bankEntry.create({
        data: {
          shipId: fromShipId,
          year,
          amountGco2eq: -applyResult.transferredAmount,
        },
      });

      await tx.bankEntry.create({
        data: {
          shipId: toShipId,
          year,
          amountGco2eq: applyResult.transferredAmount,
        },
      });

      await tx.shipCompliance.update({
        where: { id: targetCompliance.id },
        data: { cbGco2eq: applyResult.updatedTargetCB },
      });

      return {
        sourceShipId: fromShipId,
        targetShipId: toShipId,
        appliedAmount: applyResult.transferredAmount,
        targetNewCB: applyResult.updatedTargetCB,
        sourceRemainingBalance: sourceBalance - applyResult.transferredAmount,
      } satisfies BankTransferResult;
    });

    return result;
  }

  private toDomain(prismaEntry: PrismaBankEntryModel): BankEntry {
    return {
      id: prismaEntry.id,
      shipId: prismaEntry.shipId,
      transactionType: 'DEPOSIT',
      amount: prismaEntry.amountGco2eq,
      sourceYear: prismaEntry.year,
      remainingBalance: 0,
      transactionDate: prismaEntry.createdAt,
    };
  }
}
