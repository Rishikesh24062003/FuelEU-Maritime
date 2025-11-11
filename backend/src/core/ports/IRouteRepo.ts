/**
 * Route Repository Interface
 * Port for data access layer (no implementation here)
 */

import { Route } from '../domain/Route';

export interface IRouteRepo {
  /**
   * Find route by ID
   */
  findById(id: number): Promise<Route | null>;
  
  /**
   * Find routes by route ID
   */
  findByRouteId(routeId: string): Promise<Route[]>;
  
  /**
   * Find all routes for a given year
   */
  findByYear(year: number): Promise<Route[]>;
  
  /**
   * Find baseline routes
   */
  findBaselines(): Promise<Route[]>;
  
  /**
   * Save a route
   */
  save(route: Route): Promise<Route>;
  
  /**
   * Save multiple routes
   */
  saveMany(routes: Route[]): Promise<Route[]>;
  
  /**
   * Delete a route
   */
  delete(id: number): Promise<void>;
}
