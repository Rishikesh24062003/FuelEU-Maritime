import axiosClient from './axiosClient';
import { ApiResponse, Route, ComparisonData } from '../types';

export const routesApi = {
  // GET /routes - List all routes
  async getAllRoutes(): Promise<Route[]> {
    const response = await axiosClient.get<ApiResponse<Route[]>>('/routes');
    return response.data.data || [];
  },

  // POST /routes/:routeId/baseline - Set route as baseline
  async setBaseline(routeId: string): Promise<void> {
    await axiosClient.post(`/routes/${routeId}/baseline`);
  },

  // GET /routes/comparison?year=YYYY - Get comparison data
  async getComparison(year: number): Promise<ComparisonData> {
    const response = await axiosClient.get<ApiResponse<ComparisonData>>(
      `/routes/comparison`,
      { params: { year } }
    );
    return response.data.data!;
  },
};
