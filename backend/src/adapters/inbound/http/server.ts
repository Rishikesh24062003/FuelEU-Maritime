/**
 * Express Server
 * HTTP server setup with dependency injection
 */

import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from '../../../infrastructure/db/prismaClient';
import { PrismaRouteRepo } from '../../outbound/postgres/PrismaRouteRepo';
import { PrismaComplianceRepo } from '../../outbound/postgres/PrismaComplianceRepo';
import { PrismaBankingRepo } from '../../outbound/postgres/PrismaBankingRepo';
import { PrismaPoolRepo } from '../../outbound/postgres/PrismaPoolRepo';
import { RouteController } from './controllers/routeController';
import { ComplianceController } from './controllers/complianceController';
import { BankingController } from './controllers/bankingController';
import { PoolController } from './controllers/poolController';
import { createRoutes } from './routes';
import { RouteRepository } from '../../../ports/repositories/RouteRepository';
import { ComplianceRepository } from '../../../ports/repositories/ComplianceRepository';
import { BankRepository } from '../../../ports/repositories/BankRepository';
import { PoolRepository } from '../../../ports/repositories/PoolRepository';

dotenv.config();

export interface ServerDependencies {
  routeRepository?: RouteRepository;
  complianceRepository?: ComplianceRepository;
  bankingRepository?: BankRepository;
  poolRepository?: PoolRepository;
}

export function createApp(deps: ServerDependencies = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const routeRepo: RouteRepository = deps.routeRepository ?? new PrismaRouteRepo(prisma);
  const complianceRepo: ComplianceRepository = deps.complianceRepository ?? new PrismaComplianceRepo(prisma);
  const bankingRepo: BankRepository = deps.bankingRepository ?? new PrismaBankingRepo(prisma);
  const poolRepo: PoolRepository = deps.poolRepository ?? new PrismaPoolRepo(prisma);

  const routeController = new RouteController(routeRepo);
  const complianceController = new ComplianceController(complianceRepo);
  const bankingController = new BankingController(bankingRepo, complianceRepo);
  const poolController = new PoolController(poolRepo, complianceRepo);

  const routes = createRoutes(routeController, complianceController, bankingController, poolController);

  app.use('/api/v1', routes);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  });

  return app;
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`${signal} received, closing server...`);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

export default app;
