import { Route } from '../../core/domain/Route';

export interface CreateRouteDTO {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  fuelConsumption: number;
  distance: number;
  ghgIntensity: number;
  totalEmissions: number;
  isBaseline?: boolean;
}

export interface UpdateRouteDTO {
  vesselType?: string;
  fuelType?: string;
  year?: number;
  fuelConsumption?: number;
  distance?: number;
  ghgIntensity?: number;
  totalEmissions?: number;
  isBaseline?: boolean;
}

export interface RouteRepository {
  getAllRoutes(): Promise<Route[]>;
  getRouteById(id: number): Promise<Route | null>;
  getRoutesByYear(year: number): Promise<Route[]>;
  getBaselineRoute(year: number): Promise<Route | null>;
  setBaseline(routeId: string): Promise<Route | null>;
  createRoute(payload: CreateRouteDTO): Promise<Route>;
  updateRoute(id: number, payload: UpdateRouteDTO): Promise<Route>;
  deleteRoute(id: number): Promise<void>;
}
