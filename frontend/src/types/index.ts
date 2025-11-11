// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Route types
export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

// Comparison types
export interface RouteComparison {
  routeId: string;
  baselineGHG: number;
  comparisonGHG: number;
  percentDiff: number;
  compliant: boolean;
}

export interface ComparisonData {
  year: number;
  baseline: {
    routeId: string;
    ghgIntensity: number;
  };
  comparisons: RouteComparison[];
}

// Compliance types
export interface ComplianceBalance {
  shipId: string;
  year: number;
  ghgTarget: number;
  ghgActual: number;
  energyInScope: number;
  complianceBalance: number;
  status: string;
  isCompliant: boolean;
}

// Banking types
export interface BankEntry {
  id: string;
  amount: number;
  year: number;
  transactionDate: string;
}

export interface BankingRecords {
  shipId: string;
  currentBalance: number;
  records: BankEntry[];
}

export interface BankingApplyResponse {
  sourceShip: {
    shipId: string;
    remainingBank: number;
  };
  targetShip: {
    shipId: string;
    cbAfter: number;
  };
  transfer: {
    amount: number;
    status: string;
  };
}

// Pool types
export interface PoolMember {
  shipId: string;
  before: number;
  after: number;
}

export interface Pool {
  poolId: string;
  year: number;
  members: PoolMember[];
  status: string;
}
