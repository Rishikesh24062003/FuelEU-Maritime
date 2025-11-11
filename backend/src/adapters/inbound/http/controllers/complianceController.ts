/**
 * Compliance Controller
 * HTTP handlers for compliance balance calculations
 */

import { Request, Response } from 'express';
import { ComplianceRepository } from '../../../../ports/repositories/ComplianceRepository';
import { computeCBForYear } from '../../../../core/application/ComputeCB';
import { createShipCompliance } from '../../../../core/domain/ShipCompliance';
import { FUEL_LCV, DEFAULT_LCV } from '../../../../core/constants/fuelEU';

export class ComplianceController {
  constructor(private readonly complianceRepo: ComplianceRepository) {}

  /**
   * GET /compliance/cb
   * Calculate and store Compliance Balance for ships
   */
  async calculateCB(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year, ghgActual, fuelType, fuelConsumption } = req.query;

      if (!shipId || !year || !ghgActual || !fuelConsumption) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: shipId, year, ghgActual, fuelConsumption',
        });
        return;
      }

      const targetYear = parseInt(year as string);
      const actualGHG = parseFloat(ghgActual as string);
      const consumption = parseFloat(fuelConsumption as string);
      
      // Calculate energy in scope (MJ)
      const lcv = fuelType ? FUEL_LCV[fuelType as string] || DEFAULT_LCV : DEFAULT_LCV;
      const energyInScope = consumption * lcv;

      // Use Phase-1 computeCB logic
      const result = computeCBForYear(targetYear, actualGHG, energyInScope);

      // Create domain entity
      const compliance = createShipCompliance(
        shipId as string,
        targetYear,
        result.ghgTarget,
        result.ghgActual,
        result.energyInScope,
        result.complianceBalance
      );

      // Store in database
      await this.complianceRepo.save(compliance);

      res.json({
        success: true,
        data: {
          shipId: compliance.shipId,
          year: compliance.year,
          ghgTarget: compliance.ghgTarget,
          ghgActual: compliance.ghgActual,
          energyInScope: compliance.energyInScope,
          complianceBalance: compliance.complianceBalance,
          status: compliance.status,
          isCompliant: result.isCompliant,
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
   * GET /compliance/adjusted-cb
   * Get adjusted CB after banking/pooling
   */
  async getAdjustedCB(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.query;

      if (!shipId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: shipId',
        });
        return;
      }

      let records;
      if (year) {
        const targetYear = parseInt(year as string);
        const record = await this.complianceRepo.findByShipAndYear(shipId as string, targetYear);
        records = record ? [record] : [];
      } else {
        records = await this.complianceRepo.findByShipId(shipId as string);
      }

      res.json({
        success: true,
        data: records.map(r => ({
          id: r.id,
          shipId: r.shipId,
          year: r.year,
          complianceBalance: r.complianceBalance,
          status: r.status,
          calculatedAt: r.calculatedAt,
        })),
        count: records.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
