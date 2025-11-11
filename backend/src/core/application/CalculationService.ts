import { z } from 'zod';
import { FuelType } from '../shared/types';
import { GWP100, getFuelConstants, FuelEmissionConstants } from '../constants/fuelConstants';

const FUEL_RECORD_SCHEMA = z.object({
  fuelType: z.string(),
  fuelTons: z.number().nonnegative().optional(),
  energyMJ: z.number().nonnegative().optional(),
  methaneSlipFraction: z.number().min(0).max(1).optional(),
}).refine(
  (value) => value.fuelTons !== undefined || value.energyMJ !== undefined,
  {
    message: 'fuelTons or energyMJ is required',
    path: ['fuelTons'],
  }
);

export type FuelRecord = z.infer<typeof FUEL_RECORD_SCHEMA> & {
  fuelType: FuelType | string;
};

export interface EmissionBreakdown {
  /** Emission intensity (gCO2e per MJ) */
  intensity: number;
  /** Total emissions (gCO2e) */
  total: number;
  /** Energy used for the calculation (MJ) */
  energyMJ: number;
}

interface NormalizedFuelRecord {
  fuelType: string;
  energyMJ: number;
  methaneSlipFraction: number;
  constants: FuelEmissionConstants;
}

/**
 * CalculationService implements Phase 2 FuelEU core calculations.
 */
export class CalculationService {
  /** Default conversion of fuel mass (tonnes) to energy (MJ) */
  private static readonly MJ_PER_TONNE = 41000;

  calcEnergyMJ(fuelTons: number): number {
    if (!Number.isFinite(fuelTons) || fuelTons < 0) {
      throw new Error('fuelTons must be a non-negative number');
    }

    return fuelTons * CalculationService.MJ_PER_TONNE;
  }

  calcTtW(record: FuelRecord): EmissionBreakdown {
    const normalized = this.normalizeRecord(record);
    const { constants, energyMJ, methaneSlipFraction } = normalized;
    const ch4Contribution = constants.ch4Factor * methaneSlipFraction * GWP100.CH4;
    const n2oContribution = constants.n2oFactor * GWP100.N2O;
    const intensity = constants.co2Factor + ch4Contribution + n2oContribution;
    const total = intensity * energyMJ;

    return { intensity, total, energyMJ };
  }

  calcWtT(record: FuelRecord): EmissionBreakdown {
    const normalized = this.normalizeRecord(record);
    const intensity = normalized.constants.wttFactor;
    const total = intensity * normalized.energyMJ;

    return { intensity, total, energyMJ: normalized.energyMJ };
  }

  calcGHGIntensity(records: FuelRecord[], fWind = 1): number {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('records must be a non-empty array');
    }
    if (!Number.isFinite(fWind) || fWind <= 0) {
      throw new Error('fWind must be a positive number');
    }

    let totalEnergy = 0;
    let totalWtT = 0;
    let totalTtW = 0;

    for (const record of records) {
      const wtt = this.calcWtT(record);
      const ttw = this.calcTtW(record);

      totalEnergy += wtt.energyMJ;
      totalWtT += wtt.total;
      totalTtW += ttw.total;
    }

    if (totalEnergy === 0) {
      throw new Error('Total energy must be greater than zero');
    }

    const averageIntensity = (totalWtT + totalTtW) / totalEnergy;

    return fWind * averageIntensity;
  }

  calcComplianceBalance(targetIntensity: number, actualIntensity: number, energyMJ: number): number {
    this.assertPositive(targetIntensity, 'targetIntensity');
    this.assertNonNegative(actualIntensity, 'actualIntensity');
    this.assertPositive(energyMJ, 'energyMJ');

    return (targetIntensity - actualIntensity) * energyMJ;
  }

  calcPercentDiff(comparison: number, baseline: number): number {
    this.assertPositive(baseline, 'baseline');
    this.assertNonNegative(comparison, 'comparison');

    return ((comparison / baseline) - 1) * 100;
  }

  private assertPositive(value: number, label: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${label} must be a positive number`);
    }
  }

  private assertNonNegative(value: number, label: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${label} must be a non-negative number`);
    }
  }

  private normalizeRecord(record: FuelRecord): NormalizedFuelRecord {
    const parsed = FUEL_RECORD_SCHEMA.parse(record);
    const constants = getFuelConstants(parsed.fuelType);

    const energyMJ = parsed.energyMJ ?? this.energyFromLCV(parsed.fuelTons as number, constants);

    if (energyMJ <= 0) {
      throw new Error('Calculated energy must be greater than zero');
    }

    const methaneSlipFraction = parsed.methaneSlipFraction ?? constants.defaultMethaneSlip;

    return {
      fuelType: parsed.fuelType,
      energyMJ,
      methaneSlipFraction,
      constants,
    };
  }

  private energyFromLCV(fuelTons: number, constants: FuelEmissionConstants): number {
    if (!Number.isFinite(fuelTons) || fuelTons < 0) {
      throw new Error('fuelTons must be a non-negative number');
    }

    const GRAMS_PER_TONNE = 1_000_000;
    return fuelTons * GRAMS_PER_TONNE * constants.lcvMJPerGram;
  }
}
