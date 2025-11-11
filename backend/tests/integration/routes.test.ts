/**
 * Integration Tests for Route Endpoints
 */

import request from 'supertest';
import app from '../../src/adapters/inbound/http/server';
import prisma from '../../src/infrastructure/db/prismaClient';

describe('Route Integration Tests', () => {
  beforeAll(async () => {
    // Clean database
    await prisma.poolMember.deleteMany();
    await prisma.pool.deleteMany();
    await prisma.bankEntry.deleteMany();
    await prisma.shipCompliance.deleteMany();
    await prisma.route.deleteMany();

    // Seed test data
    await prisma.route.createMany({
      data: [
        {
          routeId: 'R001',
          vesselType: 'Container',
          fuelType: 'HFO',
          year: 2024,
          ghgIntensity: 91.0,
          fuelConsumption: 5000,
          distance: 12000,
          totalEmissions: 4500,
          isBaseline: false,
        },
        {
          routeId: 'R002',
          vesselType: 'BulkCarrier',
          fuelType: 'LNG',
          year: 2024,
          ghgIntensity: 88.0,
          fuelConsumption: 4800,
          distance: 11500,
          totalEmissions: 4200,
          isBaseline: false,
        },
        {
          routeId: 'R003',
          vesselType: 'Tanker',
          fuelType: 'MGO',
          year: 2024,
          ghgIntensity: 93.5,
          fuelConsumption: 5100,
          distance: 12500,
          totalEmissions: 4700,
          isBaseline: false,
        },
        {
          routeId: 'R004',
          vesselType: 'RoRo',
          fuelType: 'HFO',
          year: 2025,
          ghgIntensity: 89.2,
          fuelConsumption: 4900,
          distance: 11800,
          totalEmissions: 4300,
          isBaseline: true,
        },
        {
          routeId: 'R005',
          vesselType: 'Container',
          fuelType: 'LNG',
          year: 2025,
          ghgIntensity: 90.5,
          fuelConsumption: 4950,
          distance: 11900,
          totalEmissions: 4400,
          isBaseline: false,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /routes', () => {
    it('should return 5 seeded routes', async () => {
      const response = await request(app).get('/routes');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.count).toBe(5);
    });

    it('should return routes with correct structure', async () => {
      const response = await request(app).get('/routes');

      const route = response.body.data[0];
      expect(route).toHaveProperty('id');
      expect(route).toHaveProperty('routeId');
      expect(route).toHaveProperty('vesselType');
      expect(route).toHaveProperty('fuelType');
      expect(route).toHaveProperty('year');
      expect(route).toHaveProperty('ghgIntensity');
      expect(route).toHaveProperty('isBaseline');
    });
  });

  describe('POST /routes/:routeId/baseline', () => {
    it('should set a route as baseline within same year', async () => {
      const response = await request(app)
        .post('/routes/R001/baseline');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isBaseline).toBe(true);
      expect(response.body.data.routeId).toBe('R001');

      // Verify only one baseline per year
      const routes = await prisma.route.findMany({
        where: { year: 2024, isBaseline: true },
      });
      expect(routes).toHaveLength(1);
      expect(routes[0].routeId).toBe('R001');
    });

    it('should change baseline when setting a new one in same year', async () => {
      // First set R001 as baseline
      await request(app).post('/routes/R001/baseline');

      // Then set R002 as baseline (same year)
      const response = await request(app).post('/routes/R002/baseline');

      expect(response.status).toBe(200);
      expect(response.body.data.isBaseline).toBe(true);

      // Verify R001 is no longer baseline
      const r001 = await prisma.route.findUnique({
        where: { routeId: 'R001' },
      });
      expect(r001?.isBaseline).toBe(false);

      // Verify R002 is now baseline
      const r002 = await prisma.route.findUnique({
        where: { routeId: 'R002' },
      });
      expect(r002?.isBaseline).toBe(true);
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(app).post('/routes/R999/baseline');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /routes/comparison', () => {
    beforeEach(async () => {
      // Ensure R004 is baseline for 2025
      await prisma.route.updateMany({
        where: { year: 2025 },
        data: { isBaseline: false },
      });
      await prisma.route.update({
        where: { routeId: 'R004' },
        data: { isBaseline: true },
      });
    });

    it('should compare routes against baseline using Phase-1 logic', async () => {
      const response = await request(app)
        .get('/routes/comparison')
        .query({ year: 2025 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.baseline.routeId).toBe('R004');
      expect(response.body.data.comparisons).toHaveLength(1); // Only R005
    });

    it('should calculate correct percentage difference', async () => {
      const response = await request(app)
        .get('/routes/comparison')
        .query({ year: 2025 });

      const comparison = response.body.data.comparisons[0];
      expect(comparison.routeId).toBe('R005');
      expect(comparison.baselineGHG).toBe(89.2);
      expect(comparison.comparisonGHG).toBe(90.5);
      
      // percentDiff = ((90.5 / 89.2) - 1) × 100 ≈ 1.46%
      expect(comparison.percentDiff).toBeCloseTo(1.46, 1);
      expect(comparison.compliant).toBe(false); // 90.5 > 89.2
    });

    it('should return 404 when no baseline exists', async () => {
      const response = await request(app)
        .get('/routes/comparison')
        .query({ year: 2030 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
