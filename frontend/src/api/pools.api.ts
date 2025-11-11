import axiosClient from './axiosClient';
import { Pool } from '../types';

export const poolsApi = {
  // POST /pools - Create pool with greedy allocation
  async createPool(params: {
    year: number;
    ships: Array<{ shipId: string; shipName?: string }>;
  }): Promise<Pool> {
    const response = await axiosClient.post('/pools', params);
    return response.data;
  },
};
