/**
 * Pool Controller
 * HTTP handlers for pooling operations
 */

import { Request, Response } from 'express';
import { PoolRepository } from '../../../../ports/repositories/PoolRepository';
import { ComplianceRepository } from '../../../../ports/repositories/ComplianceRepository';

export class PoolController {
  constructor(
    private readonly poolRepo: PoolRepository,
    private readonly complianceRepo: ComplianceRepository
  ) {}

  /**
   * POST /pools
   * Create a compliance pool with greedy allocation (TRANSACTIONAL)
   */
  async createPool(req: Request, res: Response): Promise<void> {
    try {
      const { year, ships } = req.body;

      if (!year || !ships || !Array.isArray(ships) || ships.length < 2) {
        res.status(400).json({
          success: false,
          error: 'Invalid input. Required: year and ships array with at least 2 ships',
        });
        return;
      }

      const numericYear = Number(year);

      if (!Number.isInteger(numericYear) || numericYear < 2000) {
        res.status(400).json({
          success: false,
          error: 'year must be an integer >= 2000',
        });
        return;
      }

      const shipIds = ships.map((ship: any) => ship.shipId);
      const uniqueIds = new Set(shipIds);
      if (uniqueIds.size !== shipIds.length) {
        res.status(400).json({
          success: false,
          error: 'Duplicate ship IDs not allowed in pool',
        });
        return;
      }

      const complianceRecords = await Promise.all(
        shipIds.map(async (shipId: string) => {
          const compliance = await this.complianceRepo.findByShipAndYear(shipId, numericYear);
          if (!compliance) {
            throw new Error(`No compliance record found for ship ${shipId} in year ${numericYear}`);
          }
          return compliance;
        })
      );

      const totalCB = complianceRecords.reduce((sum, record) => sum + record.complianceBalance, 0);

      if (totalCB < 0) {
        res.status(400).json({
          success: false,
          error: 'Sum of compliance balances must be >= 0 to form a pool',
        });
        return;
      }

      const members = complianceRecords.map((record) => ({
        shipId: record.shipId,
        cbBefore: record.complianceBalance,
        shipName: ships.find((ship: any) => ship.shipId === record.shipId)?.shipName,
      }));

      const result = await this.poolRepo.createPool(numericYear, members);

      // UI-ready response
      res.status(201).json({
        success: true,
        poolId: result.poolId,
        year: result.year,
        members: result.members.map((member) => ({
          shipId: member.shipId,
          before: member.cbBefore,
          after: member.cbAfter,
        })),
        status: 'pool_created',
      });
    } catch (error: any) {
      // Handle specific error types
      if (error.message.includes('Sum of CB must be >= 0') || 
          error.message.includes('Pool cannot be formed')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes('already part of')) {
        res.status(409).json({
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
