/**
 * API Routes
 * Maps HTTP endpoints to controllers
 */

import { Router } from 'express';
import { RouteController } from './controllers/routeController';
import { ComplianceController } from './controllers/complianceController';
import { BankingController } from './controllers/bankingController';
import { PoolController } from './controllers/poolController';

export function createRoutes(
  routeController: RouteController,
  complianceController: ComplianceController,
  bankingController: BankingController,
  poolController: PoolController
): Router {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Route endpoints
  router.get('/routes', (req, res) => routeController.listRoutes(req, res));
  router.post('/routes/:routeId/baseline', (req, res) => routeController.setBaseline(req, res));
  router.get('/routes/comparison', (req, res) => routeController.getComparison(req, res));

  // Compliance endpoints
  router.get('/compliance/cb', (req, res) => complianceController.calculateCB(req, res));
  router.get('/compliance/adjusted-cb', (req, res) => complianceController.getAdjustedCB(req, res));

  // Banking endpoints
  router.get('/banking/records', (req, res) => bankingController.getRecords(req, res));
  router.post('/banking/bank', (req, res) => bankingController.bankCB(req, res));
  router.post('/banking/apply', (req, res) => bankingController.applyCB(req, res));

  // Pool endpoints
  router.post('/pools', (req, res) => poolController.createPool(req, res));

  return router;
}
