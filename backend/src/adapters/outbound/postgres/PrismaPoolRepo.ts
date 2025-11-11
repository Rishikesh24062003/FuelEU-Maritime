/**
 * Prisma Pool Repository
 * Implements the PoolRepository port using Prisma Client
 */

import { Prisma, PrismaClient } from '@prisma/client';
import {
  PoolRepository,
  PoolMemberInputDTO,
  PoolCreationResult,
} from '../../../ports/repositories/PoolRepository';

export class PrismaPoolRepo implements PoolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPool(year: number, members: PoolMemberInputDTO[]): Promise<PoolCreationResult> {
    if (!Number.isInteger(year)) {
      throw new Error('Year must be an integer');
    }

    if (!members || members.length < 2) {
      throw new Error('Pool must have at least two members');
    }

    const uniqueShipIds = new Set(members.map((member) => member.shipId));
    if (uniqueShipIds.size !== members.length) {
      throw new Error('Duplicate ship IDs are not allowed in a pool');
    }

    const poolingInput = members.map((member) => ({
      shipId: member.shipId,
      shipName: member.shipName,
      complianceBalance: member.cbBefore,
    }));

    const { createPool: runPoolingLogic } = await import('../../../core/application/PoolingLogic');
    const poolingResult = runPoolingLogic(poolingInput);

    if (!poolingResult.isValid) {
      throw new Error(
        poolingResult.validationErrors[0] || 'Pool cannot be formed: total compliance balance must be non-negative'
      );
    }

    const outcome = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const pool = await tx.pool.create({
        data: { year },
      });

      for (const member of poolingResult.members) {
        await tx.poolMember.create({
          data: {
            poolId: pool.id,
            shipId: member.shipId,
            cbBefore: member.initialCB,
            cbAfter: member.adjustedCB,
          },
        });

        await tx.shipCompliance.updateMany({
          where: { shipId: member.shipId, year },
          data: { cbGco2eq: member.adjustedCB },
        });
      }

      return {
        poolId: pool.id,
        year,
        members: poolingResult.members.map((member) => ({
          shipId: member.shipId,
          cbBefore: member.initialCB,
          cbAfter: member.adjustedCB,
        })),
      } satisfies PoolCreationResult;
    });

    return outcome;
  }
}
