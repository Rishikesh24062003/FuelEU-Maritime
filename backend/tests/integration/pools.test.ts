/**
 * Integration Tests for Pooling Endpoints
 */

import request from 'supertest';
import app from '../../src/adapters/inbound/http/server';
import prisma from '../../src/infrastructure/db/prismaClient';

describe('Pooling Integration Tests', () => {
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

  describe('POST /pools', () => {
    beforeEach(async () => {
      await prisma.poolMember.deleteMany();
      await prisma.pool.deleteMany();
      await prisma.shipCompliance.deleteMany();
    });

    it('should create pool with greedy allocation (Phase-1 logic + transactional)', async () => {
      // Setup: Create compliance records
      await prisma.shipCompliance.createMany({
        data: [
          { shipId: 'POOL_SHIP_1', year: 2025, cbGco2eq: 100000 }, // Surplus
          { shipId: 'POOL_SHIP_2', year: 2025, cbGco2eq: -30000 }, // Deficit
          { shipId: 'POOL_SHIP_3', year: 2025, cbGco2eq: -20000 }, // Deficit
        ],
      });

      const response = await request(app)
        .post('/pools')
        .send({
          year: 2025,
          ships: [
            { shipId: 'POOL_SHIP_1', shipName: 'Ship Alpha' },
            { shipId: 'POOL_SHIP_2', shipName: 'Ship Beta' },
            { shipId: 'POOL_SHIP_3', shipName: 'Ship Gamma' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      
      // UI-ready response format
      expect(response.body.poolId).toBeDefined();
      expect(response.body.year).toBe(2025);
      expect(response.body.status).toBe('pool_created');
      expect(response.body.members).toHaveLength(3);

      // Verify greedy allocation: deficit ships get support
      const member2 = response.body.members.find((m: any) => m.shipId === 'POOL_SHIP_2');
      const member3 = response.body.members.find((m: any) => m.shipId === 'POOL_SHIP_3');

      expect(member2).toBeDefined();
      expect(member2.before).toBe(-30000);
      expect(member2.after).toBeGreaterThanOrEqual(0); // Should be compliant after pooling

      expect(member3).toBeDefined();
      expect(member3.before).toBe(-20000);
      expect(member3.after).toBeGreaterThanOrEqual(0); // Should be compliant after pooling

      // Verify DB updates
      const poolMembers = await prisma.poolMember.findMany();
      expect(poolMembers.length).toBeGreaterThanOrEqual(3);

      // Verify compliance records updated
      const updatedCompliance = await prisma.shipCompliance.findMany({
        where: { year: 2025 },
      });
      
      const ship2Compliance = updatedCompliance.find(c => c.shipId === 'POOL_SHIP_2');
      const ship3Compliance = updatedCompliance.find(c => c.shipId === 'POOL_SHIP_3');
      
      expect(ship2Compliance?.cbGco2eq).toBeGreaterThanOrEqual(0);
      expect(ship3Compliance?.cbGco2eq).toBeGreaterThanOrEqual(0);
    });

    it('should fail when sum(CB) < 0 (Phase-1 validation)', async () => {
      // Setup: Total CB is negative
      await prisma.shipCompliance.createMany({
        data: [
          { shipId: 'NEG_POOL_1', year: 2025, cbGco2eq: 20000 },  // Surplus
          { shipId: 'NEG_POOL_2', year: 2025, cbGco2eq: -50000 }, // Large deficit
        ],
      });

      const response = await request(app)
        .post('/pools')
        .send({
          year: 2025,
          ships: [
            { shipId: 'NEG_POOL_1' },
            { shipId: 'NEG_POOL_2' },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Pool creation failed');
      expect(response.body.reason).toContain('CB must be >= 0');
    });

    it('should ensure deficit ship never exits worse', async () => {
      await prisma.shipCompliance.createMany({
        data: [
          { shipId: 'DEF_TEST_1', year: 2025, cbGco2eq: 100000 },
          { shipId: 'DEF_TEST_2', year: 2025, cbGco2eq: -10000 },
        ],
      });

      const response = await request(app)
        .post('/pools')
        .send({
          year: 2025,
          ships: [
            { shipId: 'DEF_TEST_1' },
            { shipId: 'DEF_TEST_2' },
          ],
        });

      expect(response.status).toBe(201);
      
      const deficitMember = response.body.members.find((m: any) => m.shipId === 'DEF_TEST_2');
      
      // Initial was -10000, should be >= -10000 (not worse)
      expect(deficitMember.after).toBeGreaterThanOrEqual(deficitMember.before);
    });

    it('should ensure surplus ship does not exit with negative CB', async () => {
      await prisma.shipCompliance.createMany({
        data: [
          { shipId: 'SUR_TEST_1', year: 2025, cbGco2eq: 30000 },  // Small surplus
          { shipId: 'SUR_TEST_2', year: 2025, cbGco2eq: -20000 }, // Deficit
        ],
      });

      const response = await request(app)
        .post('/pools')
        .send({
          year: 2025,
          ships: [
            { shipId: 'SUR_TEST_1' },
            { shipId: 'SUR_TEST_2' },
          ],
        });

      expect(response.status).toBe(201);
      
      const surplusMember = response.body.members.find((m: any) => m.shipId === 'SUR_TEST_1');
      
      // Surplus ship should not exit negative
      expect(surplusMember.after).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 for invalid input', async () => {
      const response1 = await request(app)
        .post('/pools')
        .send({ year: 2025 }); // Missing ships

      expect(response1.status).toBe(400);

      const response2 = await request(app)
        .post('/pools')
        .send({ 
          year: 2025, 
          ships: [{ shipId: 'SINGLE' }] // Only 1 ship
        });

      expect(response2.status).toBe(400);
    });

    it('should return 404 for non-existent ship compliance', async () => {
      const response = await request(app)
        .post('/pools')
        .send({
          year: 2025,
          ships: [
            { shipId: 'NONEXISTENT_1' },
            { shipId: 'NONEXISTENT_2' },
          ],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should implement greedy allocation correctly', async () => {
      // Multiple surplus and deficit ships
      await prisma.shipCompliance.createMany({
        data: [
          { shipId: 'GREEDY_1', year: 2025, cbGco2eq: 150000 }, // Largest surplus
          { shipId: 'GREEDY_2', year: 2025, cbGco2eq: 50000 },  // Smaller surplus
          { shipId: 'GREEDY_3', year: 2025, cbGco2eq: -60000 }, // Deficit
          { shipId: 'GREEDY_4', year: 2025, cbGco2eq: -40000 }, // Smaller deficit
        ],
      });

      const response = await request(app)
        .post('/pools')
        .send({
          year: 2025,
          ships: [
            { shipId: 'GREEDY_1' },
            { shipId: 'GREEDY_2' },
            { shipId: 'GREEDY_3' },
            { shipId: 'GREEDY_4' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.members).toHaveLength(4);
      
      // Calculate total CB
      const totalBefore = response.body.members.reduce((sum: number, m: any) => sum + m.before, 0);
      const totalAfter = response.body.members.reduce((sum: number, m: any) => sum + m.after, 0);
      
      expect(totalBefore).toBe(100000); // 150 + 50 - 60 - 40
      expect(totalAfter).toBe(100000); // Should be conserved

      // All ships should be compliant or better after pooling
      response.body.members.forEach((member: any) => {
        expect(member.after).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
