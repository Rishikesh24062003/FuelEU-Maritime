/**
 * ComputeComparison - Compare routes against baseline
 * 
 * Formula: percentDiff = ((comparison / baseline) - 1) × 100
 * 
 * A route is compliant if comparison <= baseline (i.e., percentDiff <= 0)
 */

import { ValidationError } from '../shared/errors';

export interface ComparisonInput {
  /** Route identifier */
  routeId: string;
  
  /** Baseline GHG intensity in gCO2e/MJ */
  baselineGHG: number;
  
  /** Comparison GHG intensity in gCO2e/MJ */
  comparisonGHG: number;
}

export interface ComparisonResult {
  /** Route identifier */
  routeId: string;
  
  /** Baseline GHG intensity */
  baselineGHG: number;
  
  /** Comparison GHG intensity */
  comparisonGHG: number;
  
  /** Percentage difference */
  percentDiff: number;
  
  /** Whether route is compliant (comparison <= baseline) */
  compliant: boolean;
  
  /** Absolute difference */
  absoluteDiff: number;
}

/**
 * Compute comparison between a route and its baseline
 */
export function computeComparison(input: ComparisonInput): ComparisonResult {
  validateInput(input);
  
  const { routeId, baselineGHG, comparisonGHG } = input;
  
  // percentDiff = ((comparison / baseline) - 1) × 100
  const percentDiff = ((comparisonGHG / baselineGHG) - 1) * 100;
  
  // Absolute difference
  const absoluteDiff = comparisonGHG - baselineGHG;
  
  // Compliant if comparison <= baseline (i.e., percentDiff <= 0)
  const compliant = comparisonGHG <= baselineGHG;
  
  return {
    routeId,
    baselineGHG,
    comparisonGHG,
    percentDiff,
    compliant,
    absoluteDiff,
  };
}

/**
 * Validate comparison input
 */
function validateInput(input: ComparisonInput): void {
  if (!input.routeId || input.routeId.trim() === '') {
    throw new ValidationError('Route ID is required');
  }
  
  if (input.baselineGHG <= 0) {
    throw new ValidationError('Baseline GHG must be positive');
  }
  
  if (input.comparisonGHG < 0) {
    throw new ValidationError('Comparison GHG cannot be negative');
  }
}

/**
 * Batch compute comparisons for multiple routes
 */
export function computeComparisonBatch(
  inputs: ComparisonInput[]
): ComparisonResult[] {
  return inputs.map(input => computeComparison(input));
}

/**
 * Helper to determine if a set of routes are all compliant
 */
export function areAllCompliant(comparisons: ComparisonResult[]): boolean {
  return comparisons.every(c => c.compliant);
}

/**
 * Helper to get non-compliant routes
 */
export function getNonCompliantRoutes(comparisons: ComparisonResult[]): ComparisonResult[] {
  return comparisons.filter(c => !c.compliant);
}

/**
 * Helper to get compliant routes
 */
export function getCompliantRoutes(comparisons: ComparisonResult[]): ComparisonResult[] {
  return comparisons.filter(c => c.compliant);
}
