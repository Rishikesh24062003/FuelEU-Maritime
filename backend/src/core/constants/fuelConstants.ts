/**
 * FuelEU Annex II Default Constants
 * Lower calorific values (LCV), upstream (WtT) and tank-to-wake (TtW) factors.
 *
 * Units:
 *  - lcvMJPerGram: MJ of energy per gram of fuel (multiply by fuel mass in grams)
 *  - wttFactor: gCO2e per MJ (upstream Well-to-Tank)
 *  - co2Factor: gCO2 per MJ (Tank-to-Wake direct CO2)
 *  - ch4Factor: gCH4 per MJ (before applying methane slip & GWP)
 *  - n2oFactor: gN2O per MJ (before applying GWP)
 *  - defaultMethaneSlip: fraction (0-1) applied to CH₄ factor to model slip
 */

export interface FuelEmissionConstants {
  /** Fuel label matching domain FuelType */
  fuelType: string;
  /** Lower calorific value (MJ per gram) */
  lcvMJPerGram: number;
  /** Upstream (Well-to-Tank) factor in gCO2e/MJ */
  wttFactor: number;
  /** Direct CO₂ factor in g/MJ */
  co2Factor: number;
  /** Direct CH₄ factor in g/MJ (before slip + GWP) */
  ch4Factor: number;
  /** Direct N₂O factor in g/MJ (before GWP) */
  n2oFactor: number;
  /** Default methane slip fraction (0 - 1) */
  defaultMethaneSlip: number;
}

export const GWP100 = {
  /** Methane 100-year global warming potential */
  CH4: 25,
  /** Nitrous oxide 100-year global warming potential */
  N2O: 298,
} as const;

export const FUEL_EMISSION_CONSTANTS: Record<string, FuelEmissionConstants> = {
  HFO: {
    fuelType: 'HFO',
    lcvMJPerGram: 0.0405,
    wttFactor: 13.5,
    co2Factor: 77.4,
    ch4Factor: 0.003,
    n2oFactor: 0.006,
    defaultMethaneSlip: 0,
  },
  MDO: {
    fuelType: 'MDO',
    lcvMJPerGram: 0.0427,
    wttFactor: 13.75,
    co2Factor: 74.1,
    ch4Factor: 0.003,
    n2oFactor: 0.006,
    defaultMethaneSlip: 0,
  },
  MGO: {
    fuelType: 'MGO',
    lcvMJPerGram: 0.0427,
    wttFactor: 13.75,
    co2Factor: 74.1,
    ch4Factor: 0.003,
    n2oFactor: 0.006,
    defaultMethaneSlip: 0,
  },
  LNG: {
    fuelType: 'LNG',
    lcvMJPerGram: 0.0495,
    wttFactor: 18,
    co2Factor: 56.1,
    ch4Factor: 0.21,
    n2oFactor: 0.001,
    defaultMethaneSlip: 0.03,
  },
  Methanol: {
    fuelType: 'Methanol',
    lcvMJPerGram: 0.0199,
    wttFactor: 17.7,
    co2Factor: 65,
    ch4Factor: 0.003,
    n2oFactor: 0.006,
    defaultMethaneSlip: 0,
  },
  Ammonia: {
    fuelType: 'Ammonia',
    lcvMJPerGram: 0.0186,
    wttFactor: 31.8,
    co2Factor: 0,
    ch4Factor: 0,
    n2oFactor: 0.2,
    defaultMethaneSlip: 0,
  },
  Hydrogen: {
    fuelType: 'Hydrogen',
    lcvMJPerGram: 0.12,
    wttFactor: 120,
    co2Factor: 0,
    ch4Factor: 0,
    n2oFactor: 0,
    defaultMethaneSlip: 0,
  },
  Other: {
    fuelType: 'Other',
    lcvMJPerGram: 0.041,
    wttFactor: 15,
    co2Factor: 75,
    ch4Factor: 0.003,
    n2oFactor: 0.006,
    defaultMethaneSlip: 0,
  },
};

export const DEFAULT_FUEL_CONSTANTS = FUEL_EMISSION_CONSTANTS.Other;

export function getFuelConstants(fuelType: string): FuelEmissionConstants {
  return FUEL_EMISSION_CONSTANTS[fuelType] ?? DEFAULT_FUEL_CONSTANTS;
}
