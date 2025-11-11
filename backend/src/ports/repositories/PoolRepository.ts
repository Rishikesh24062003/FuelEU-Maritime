export interface PoolMemberInputDTO {
  shipId: string;
  cbBefore: number;
  shipName?: string;
}

export interface PoolMemberResultDTO {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolCreationResult {
  poolId: string;
  year: number;
  members: PoolMemberResultDTO[];
}

export interface PoolRepository {
  createPool(year: number, members: PoolMemberInputDTO[]): Promise<PoolCreationResult>;
}
