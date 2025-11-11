/**
 * Integration Tests for Banking Endpoints
 */

import request from 'supertest';
import app from '../../src/adapters/inbound/http/server';
import prisma from '../../src/infrastructure/db/prismaClient';

describe('Banking Integration Tests', () => {
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

  describe('POST /banking/bank', () => {
    beforeEach(async () => {
      await prisma.bankEntry.deleteMany();
      await prisma.shipCompliance.deleteMany();

      // Create test compliance record with positive CB
      await prisma.shipCompliance.create({
        data: {
          shipId: 'BANK_SHIP_001',
          year: 2025,
          cbGco2eq: 100000, // Positive CB
        },
      });
    });

    it('should allow banking positive CB', async () => {
      const response = await request(app)
        .post('/banking/bank')
        .send({
          shipId: 'BANK_SHIP_001',
          year: 2025,
          amount: 50000,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bankedAmount).toBe(50000);
      expect(response.body.data.remainingCB).toBe(50000);

      // Verify bank entry created
      const entries = await prisma.bankEntry.findMany({
        where: { shipId: 'BANK_SHIP_001' },
      });
      expect(entries).toHaveLength(1);
      expect(entries[0].amountGco2eq).toBe(50000);

      // Verify compliance updated
      const compliance = await prisma.shipCompliance.findFirst({
        where: { shipId: 'BANK_SHIP_001', year: 2025 },
      });
      expect(compliance?.cbGco2eq).toBe(50000);
    });

    it('should NOT allow banking when CB <= 0 (Phase-1 rule)', async () => {
      // Create ship with zero CB
      await prisma.shipCompliance.create({
        data: {
          shipId: 'BANK_SHIP_ZERO',
          year: 2025,
          cbGco2eq: 0,
        },
      });

      const response = await request(app)
        .post('/banking/bank')
        .send({
          shipId: 'BANK_SHIP_ZERO',
          year: 2025,
          amount: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('positive');
    });

    it('should NOT allow banking negative CB', async () => {
      await prisma.shipCompliance.create({
        data: {
          shipId: 'BANK_SHIP_NEG',
          year: 2025,
          cbGco2eq: -50000,
        },
      });

      const response = await request(app)
        .post('/banking/bank')
        .send({
          shipId: 'BANK_SHIP_NEG',
          year: 2025,
          amount: 10000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should prevent overdraft', async () => {
      const response = await request(app)
        .post('/banking/bank')
        .send({
          shipId: 'BANK_SHIP_001',
          year: 2025,
          amount: 150000, // More than available 100000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/banking/bank')
        .send({ shipId: 'BANK_SHIP_001' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /banking/apply', () => {
    beforeEach(async () => {
      await prisma.bankEntry.deleteMany();
      await prisma.shipCompliance.deleteMany();

      // Source ship with banked CB
      await prisma.bankEntry.create({
        data: {
          shipId: 'SOURCE_SHIP',
          year: 2025,
          amountGco2eq: 80000, // Has 80k banked
        },
      });

      // Target ship with deficit
      await prisma.shipCompliance.create({
        data: {
          shipId: 'TARGET_SHIP',
          year: 2025,
          cbGco2eq: -30000, // Deficit
        },
      });
    });

    it('should apply banked CB to reduce deficit (Phase-1 logic + transactional)', async () => {
      const response = await request(app)
        .post('/banking/apply')
        .send({
          sourceShipId: 'SOURCE_SHIP',
          targetShipId: 'TARGET_SHIP',
          year: 2025,
          amount: 30000,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      
      // UI-ready response format
      expect(response.body.sourceShip).toBeDefined();
      expect(response.body.sourceShip.shipId).toBe('SOURCE_SHIP');
      expect(response.body.sourceShip.remainingBank).toBe(50000); // 80000 - 30000

      expect(response.body.targetShip).toBeDefined();
      expect(response.body.targetShip.shipId).toBe('TARGET_SHIP');
      expect(response.body.targetShip.cbAfter).toBe(0); // -30000 + 30000 = 0

      expect(response.body.transfer).toBeDefined();
      expect(response.body.transfer.amount).toBe(30000);
      expect(response.body.transfer.status).toBe('applied');

      // Verify target compliance updated in DB
      const targetCompliance = await prisma.shipCompliance.findFirst({
        where: { shipId: 'TARGET_SHIP', year: 2025 },
      });
      expect(targetCompliance?.cbGco2eq).toBe(0);

      // Verify withdrawal entry created in DB
      const withdrawalEntry = await prisma.bankEntry.findFirst({
        where: { shipId: 'SOURCE_SHIP', amountGco2eq: { lt: 0 } },
      });
      expect(withdrawalEntry).toBeTruthy();
      expect(withdrawalEntry?.amountGco2eq).toBe(-30000);
    });

    it('should prevent overdraft when applying', async () => {
      const response = await request(app)
        .post('/banking/apply')
        .send({
          sourceShipId: 'SOURCE_SHIP',
          targetShipId: 'TARGET_SHIP',
          year: 2025,
          amount: 100000, // More than available 80k
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient');
    });

    it('should return 404 for non-existent target ship', async () => {
      const response = await request(app)
        .post('/banking/apply')
        .send({
          sourceShipId: 'SOURCE_SHIP',
          targetShipId: 'NONEXISTENT',
          year: 2025,
          amount: 10000,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /banking/records', () => {
    beforeEach(async () => {
      await prisma.bankEntry.deleteMany();

      await prisma.bankEntry.createMany({
        data: [
          {
            shipId: 'RECORD_SHIP',
            year: 2025,
            amountGco2eq: 50000,
          },
          {
            shipId: 'RECORD_SHIP',
            year: 2024,
            amountGco2eq: 30000,
          },
        ],
      });
    });

    it('should return all banking records for a ship', async () => {
      const response = await request(app)
        .get('/banking/records')
        .query({ shipId: 'RECORD_SHIP' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shipId).toBe('RECORD_SHIP');
      expect(response.body.data.currentBalance).toBe(80000);
      expect(response.body.data.records).toHaveLength(2);
    });

    it('should return 400 for missing shipId', async () => {
      const response = await request(app).get('/banking/records');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
