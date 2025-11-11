/**
 * Prisma Repository Implementation for Compliance
 * Adapts Prisma to IComplianceRepo port interface
 */

import { PrismaClient, ShipCompliance as PrismaShipComplianceModel } from '@prisma/client';
import { IComplianceRepo } from '../../../core/ports/IComplianceRepo';
import { ShipCompliance } from '../../../core/domain/ShipCompliance';

export class PrismaComplianceRepo implements IComplianceRepo {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ShipCompliance | null> {
    const record = await this.prisma.shipCompliance.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByShipId(shipId: string): Promise<ShipCompliance[]> {
    const records = await this.prisma.shipCompliance.findMany({
      where: { shipId },
      orderBy: { recordedAt: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    const record = await this.prisma.shipCompliance.findFirst({
      where: {
        shipId,
        year,
      },
      orderBy: { recordedAt: 'desc' },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByYear(year: number): Promise<ShipCompliance[]> {
    const records = await this.prisma.shipCompliance.findMany({
      where: { year },
      orderBy: { recordedAt: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async save(compliance: ShipCompliance): Promise<ShipCompliance> {
    const created = await this.prisma.shipCompliance.create({
      data: {
        id: compliance.id,
        shipId: compliance.shipId,
        year: compliance.year,
        cbGco2eq: compliance.complianceBalance,
        recordedAt: compliance.calculatedAt || new Date(),
      },
    });

    return this.toDomain(created);
  }

  async saveMany(compliances: ShipCompliance[]): Promise<ShipCompliance[]> {
    const saved: ShipCompliance[] = [];
    for (const compliance of compliances) {
      const result = await this.save(compliance);
      saved.push(result);
    }
    return saved;
  }

  async update(id: string, data: Partial<ShipCompliance>): Promise<ShipCompliance> {
    const updated = await this.prisma.shipCompliance.update({
      where: { id },
      data: {
        ...(data.shipId !== undefined && { shipId: data.shipId }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.complianceBalance !== undefined && { cbGco2eq: data.complianceBalance }),
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.shipCompliance.delete({
      where: { id },
    });
  }

  /**
   * Convert Prisma model to Domain entity
   */
  private toDomain(prismaRecord: PrismaShipComplianceModel): ShipCompliance {
    return {
      id: prismaRecord.id,
      shipId: prismaRecord.shipId,
      year: prismaRecord.year,
      ghgTarget: 0, // Not stored in DB, calculated from constants
      ghgActual: 0, // Not stored in DB, calculated from route data
      energyInScope: 0, // Not stored in DB, calculated from route data
      complianceBalance: prismaRecord.cbGco2eq,
      status: prismaRecord.cbGco2eq >= 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
      calculatedAt: prismaRecord.recordedAt,
    };
  }
}
