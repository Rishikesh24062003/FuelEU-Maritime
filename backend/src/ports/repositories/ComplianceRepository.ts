import { ShipCompliance } from '../../core/domain/ShipCompliance';

export interface ComplianceRepository {
  findById(id: string): Promise<ShipCompliance | null>;
  findByShipId(shipId: string): Promise<ShipCompliance[]>;
  findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
  findByYear(year: number): Promise<ShipCompliance[]>;
  save(compliance: ShipCompliance): Promise<ShipCompliance>;
  saveMany(compliances: ShipCompliance[]): Promise<ShipCompliance[]>;
  update(id: string, data: Partial<ShipCompliance>): Promise<ShipCompliance>;
  delete(id: string): Promise<void>;
}
