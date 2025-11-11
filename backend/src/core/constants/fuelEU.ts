/**
 * FuelEU Maritime Regulation Constants
 * These values are fixed for compliance calculations
 */

/**
 * GHG Target Intensity for 2025
 * Fixed value: 89.3368 gCO2e/MJ
 */
export const GHG_TARGET_2025 = 89.3368; // gCO2e/MJ

/**
 * GHG Targets by Year (for future extensibility)
 */
export const GHG_TARGETS: Record<number, number> = {
  2025: 89.3368,
  2026: 87.5,
  2027: 85.0,
  2028: 82.5,
  2029: 80.0,
  2030: 77.5,
};

/**
 * Energy conversion factor
 * Lower Calorific Value (LCV) for fuel types in MJ/ton
 */
export const FUEL_LCV: Record<string, number> = {
  HFO: 40.4,    // Heavy Fuel Oil
  MDO: 42.7,    // Marine Diesel Oil
  LNG: 48.0,    // Liquefied Natural Gas
  MGO: 42.7,    // Marine Gas Oil
  Methanol: 19.9,
  Ammonia: 18.6,
  Hydrogen: 120.0,
};

/**
 * Default LCV if fuel type not specified
 */
export const DEFAULT_LCV = 41.0; // MJ/ton
