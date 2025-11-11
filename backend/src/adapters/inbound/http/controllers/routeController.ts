/**
 * Route Controller
 * HTTP handlers for route-related endpoints
 */

import { Request, Response } from 'express';
import { RouteRepository } from '../../../../ports/repositories/RouteRepository';
import { Route } from '../../../../core/domain/Route';
import { computeComparison } from '../../../../core/application/ComputeComparison';

export class RouteController {
  constructor(private readonly routeRepo: RouteRepository) {}

  /**
   * GET /routes
   * List all routes
   */
  async listRoutes(_req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.routeRepo.getAllRoutes();
      
      res.json({
        success: true,
        data: routes.map((route: Route) => ({
          id: route.id,
          routeId: route.routeId,
          vesselType: route.vesselType,
          fuelType: route.fuelType,
          year: route.year,
          ghgIntensity: route.ghgIntensity,
          fuelConsumption: route.fuelConsumption,
          distance: route.distance,
          totalEmissions: route.totalEmissions,
          isBaseline: route.isBaseline,
        })),
        count: routes.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /routes/:routeId/baseline
   * Set a route as baseline (only one per year)
   */
  async setBaseline(req: Request, res: Response): Promise<void> {
    try {
      const { routeId } = req.params;

      if (!routeId) {
        res.status(400).json({
          success: false,
          error: 'Route ID is required',
        });
        return;
      }

      const updated = await this.routeRepo.setBaseline(routeId);
      
      if (!updated) {
        res.status(404).json({
          success: false,
          error: `Route ${routeId} not found`,
        });
        return;
      }

      res.json({
        success: true,
        message: `Route ${routeId} set as baseline for year ${updated.year}`,
        data: {
          id: updated.id,
          routeId: updated.routeId,
          year: updated.year,
          isBaseline: updated.isBaseline,
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
   * GET /routes/comparison
   * Compare routes against baseline using Phase-1 logic
   */
  async getComparison(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.query;
      const targetYear = year ? Number(year) : new Date().getFullYear();

      if (!Number.isInteger(targetYear) || targetYear < 2000) {
        res.status(400).json({
          success: false,
          error: 'year must be a valid integer (>= 2000)',
        });
        return;
      }

      // Get baseline for the year
      const baseline = await this.routeRepo.getBaselineRoute(targetYear);
      
      if (!baseline) {
        res.status(404).json({
          success: false,
          error: `No baseline found for year ${targetYear}`,
        });
        return;
      }

      // Get all routes for comparison
      const routes = await this.routeRepo.getRoutesByYear(targetYear);
      const comparisonRoutes = routes.filter((route: Route) => !route.isBaseline);

      // Use Phase-1 ComputeComparison logic
      const comparisons = comparisonRoutes.map((route: Route) => 
        computeComparison({
          routeId: route.routeId,
          baselineGHG: baseline.ghgIntensity,
          comparisonGHG: route.ghgIntensity,
        })
      );

      res.json({
        success: true,
        data: {
          year: targetYear,
          baseline: {
            routeId: baseline.routeId,
            ghgIntensity: baseline.ghgIntensity,
          },
          comparisons,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
