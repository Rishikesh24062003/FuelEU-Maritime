import axiosClient from './axiosClient';
import { ApiResponse, ComplianceBalance } from '../types';

export const complianceApi = {
  // GET /compliance/cb - Calculate and store CB
  async calculateCB(params: {
    shipId: string;
    year: number;
    ghgActual: number;
    fuelType: string;
    fuelConsumption: number;
  }): Promise<ComplianceBalance> {
    const response = await axiosClient.get<ApiResponse<ComplianceBalance>>(
      '/compliance/cb',
      { params }
    );
    return response.data.data!;
  },

  // GET /compliance/adjusted-cb - Get adjusted CB
  async getAdjustedCB(shipId: string, year?: number): Promise<any[]> {
    const response = await axiosClient.get<ApiResponse<any[]>>(
      '/compliance/adjusted-cb',
      { params: { shipId, year } }
    );
    return response.data.data || [];
  },
};
