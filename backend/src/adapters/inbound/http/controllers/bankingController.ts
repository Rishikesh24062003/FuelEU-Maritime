/**
 * Banking Controller
 * HTTP handlers for banking operations
 */

import { Request, Response } from 'express';
import { BankRepository } from '../../../../ports/repositories/BankRepository';
import { ComplianceRepository } from '../../../../ports/repositories/ComplianceRepository';
import { validateCanBank, applyBank } from '../../../../core/application/BankingLogic';

export class BankingController {
  constructor(
    private readonly bankingRepo: BankRepository,
    private readonly complianceRepo: ComplianceRepository
  ) {}

  /**
   * GET /banking/records
   * Get all banking records for a ship
   */
  async getRecords(req: Request, res: Response): Promise<void> {
    try {
      const { shipId } = req.query;

      if (!shipId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: shipId',
        });
        return;
      }

      const records = await this.bankingRepo.getEntries(shipId as string);
      const balance = await this.bankingRepo.getBalance(shipId as string);

      res.json({
        success: true,
        data: {
          shipId,
          currentBalance: balance,
          records: records.map((record) => ({
            id: record.id,
            amount: record.amount,
            year: record.sourceYear,
            transactionDate: record.transactionDate,
          })),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /banking/bank
   * Bank positive CB for future use
   */
  async bankCB(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year, amount } = req.body;

      if (!shipId || !year || amount === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: shipId, year, amount',
        });
        return;
      }

      const numericYear = Number(year);
      const numericAmount = Number(amount);

      if (!Number.isInteger(numericYear) || numericYear < 2000) {
        res.status(400).json({
          success: false,
          error: 'year must be an integer >= 2000',
        });
        return;
      }

      if (!Number.isFinite(numericAmount)) {
        res.status(400).json({
          success: false,
          error: 'amount must be numeric',
        });
        return;
      }

      const validation = validateCanBank(numericAmount);

      if (!validation.canBank) {
        res.status(400).json({
          success: false,
          error: validation.reason,
        });
        return;
      }

      // Get current compliance record
      const compliance = await this.complianceRepo.findByShipAndYear(shipId, numericYear);

      if (!compliance) {
        res.status(404).json({
          success: false,
          error: `No compliance record found for ship ${shipId} in year ${numericYear}`,
        });
        return;
      }

      // Validate that ship has enough CB to bank
      if (compliance.complianceBalance < numericAmount) {
        res.status(400).json({
          success: false,
          error: `Insufficient CB to bank. Available: ${compliance.complianceBalance}, Requested: ${numericAmount}`,
        });
        return;
      }

      const result = applyBank(compliance.complianceBalance, numericAmount);

      await this.bankingRepo.createEntry({
        shipId,
        year: numericYear,
        amountGco2eq: result.transferredAmount,
      });

      // Update compliance record
      await this.complianceRepo.update(compliance.id, {
        complianceBalance: result.updatedSourceCB,
      });

      res.json({
        success: true,
        message: `Successfully banked ${numericAmount} gCO2e`,
        data: {
          shipId,
          year: numericYear,
          bankedAmount: result.transferredAmount,
          remainingCB: result.updatedSourceCB,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /banking/apply
   * Apply banked CB to reduce deficit (TRANSACTIONAL)
   */
  async applyCB(req: Request, res: Response): Promise<void> {
    try {
      const { sourceShipId, targetShipId, year, amount } = req.body;

      if (!sourceShipId || !targetShipId || !year || amount === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: sourceShipId, targetShipId, year, amount',
        });
        return;
      }

      const numericYear = Number(year);
      const numericAmount = Number(amount);

      if (!Number.isInteger(numericYear) || numericYear < 2000) {
        res.status(400).json({
          success: false,
          error: 'year must be an integer >= 2000',
        });
        return;
      }

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
        return;
      }

      const result = await this.bankingRepo.applyTransfer({
        fromShipId: sourceShipId,
        toShipId: targetShipId,
        year: numericYear,
        amount: numericAmount,
      });

      // UI-ready response
      res.status(201).json({
        success: true,
        sourceShip: {
          shipId: result.sourceShipId,
          remainingBank: result.sourceRemainingBalance,
        },
        targetShip: {
          shipId: result.targetShipId,
          cbAfter: result.targetNewCB,
        },
        transfer: {
          amount: result.appliedAmount,
          status: 'applied',
        },
      });
    } catch (error: any) {
      // Handle specific error types
      if (error.message.includes('Insufficient')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    }
  }
}
