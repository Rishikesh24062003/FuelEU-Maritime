import axiosClient from './axiosClient';
import { ApiResponse, BankingRecords, BankingApplyResponse } from '../types';

export const bankingApi = {
  // GET /banking/records - Get banking records
  async getRecords(shipId: string): Promise<BankingRecords> {
    const response = await axiosClient.get<ApiResponse<BankingRecords>>(
      '/banking/records',
      { params: { shipId } }
    );
    return response.data.data!;
  },

  // POST /banking/bank - Bank positive CB
  async bankCB(params: {
    shipId: string;
    year: number;
    amount: number;
  }): Promise<any> {
    const response = await axiosClient.post('/banking/bank', params);
    return response.data;
  },

  // POST /banking/apply - Apply banked CB to deficit
  async applyCB(params: {
    sourceShipId: string;
    targetShipId: string;
    year: number;
    amount: number;
  }): Promise<BankingApplyResponse> {
    const response = await axiosClient.post('/banking/apply', params);
    return response.data;
  },
};
