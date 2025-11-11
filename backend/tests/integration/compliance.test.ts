/**
 * Integration Tests for Compliance Endpoints
 */

import request from 'supertest';
import app from '../../src/adapters/inbound/http/server';
import prisma from '../../src/infrastructure/db/prismaClient';

describe('Compliance Integration Tests', () => {
  beforeAll(async () => {
    await prisma.poolMember.deleteMany();
    await prisma.pool.deleteMany();
    await prisma.bankEntry.deleteMany();
    await prisma.shipCompliance.deleteMany();
    await prisma.route.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /compliance/cb', () => {
    it('should calculate and store CB using Phase-1 logic', async () => {
      const response = await request(app)
        .get('/compliance/cb')
        .query({
          shipId: 'SHIP001',
          year: 2025,
          ghgActual: 85.0,
          fuelType: 'HFO',
          fuelConsumption: 1000, // tons
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shipId).toBe('SHIP001');
      expect(response.body.data.year).toBe(2025);
      expect(response.body.data.ghgTarget).toBe(89.3368);
      expect(response.body.data.ghgActual).toBe(85.0);

      // Energy = 1000 tons × 40.4 MJ/ton (HFO LCV) = 40,400 MJ
      // CB = (89.3368 - 85.0) × 40,400 = 175,206.72 gCO2e
      expect(response.body.data.complianceBalance).toBeCloseTo(175206.72, 0);
      expect(response.body.data.isCompliant).toBe(true);
      expect(response.body.data.status).toBe('COMPLIANT');

      // Verify stored in database
      const record = await prisma.shipCompliance.findFirst({
        where: { shipId: 'SHIP001', year: 2025 },
      });
      expect(record).toBeTruthy();
      expect(record?.cbGco2eq).toBeCloseTo(175206.72, 0);
    });

    it('should calculate negative CB for deficit ship', async () => {
      const response = await request(app)
        .get('/compliance/cb')
        .query({
          shipId: 'SHIP002',
          year: 2025,
          ghgActual: 95.0,
          fuelType: 'HFO',
          fuelConsumption: 1000,
        });

      expect(response.status).toBe(200);
      
      // CB = (89.3368 - 95.0) × 40,400 = -228,753.28 gCO2e
      expect(response.body.data.complianceBalance).toBeCloseTo(-228753.28, 0);
      expect(response.body.data.isCompliant).toBe(false);
      expect(response.body.data.status).toBe('NON_COMPLIANT');
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .get('/compliance/cb')
        .query({ shipId: 'SHIP003' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /compliance/adjusted-cb', () => {
    beforeEach(async () => {
      await prisma.shipCompliance.deleteMany();
      
      // Create test compliance records
      await prisma.shipCompliance.createMany({
        data: [
          {
            shipId: 'SHIP_ADJ_001',
            year: 2025,
            cbGco2eq: 100000,
          },
          {
            shipId: 'SHIP_ADJ_001',
            year: 2024,
            cbGco2eq: 50000,
          },
        ],
      });
    });

    it('should return all compliance records for a ship', async () => {
      const response = await request(app)
        .get('/compliance/adjusted-cb')
        .query({ shipId: 'SHIP_ADJ_001' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should filter by year', async () => {
      const response = await request(app)
        .get('/compliance/adjusted-cb')
        .query({ shipId: 'SHIP_ADJ_001', year: 2025 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].year).toBe(2025);
      expect(response.body.data[0].complianceBalance).toBe(100000);
    });

    it('should return 400 for missing shipId', async () => {
      const response = await request(app).get('/compliance/adjusted-cb');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
