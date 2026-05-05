import { RoyaltyLine } from "./RoyaltyLine";

export interface RoyaltyRepository {
  findAll(): Promise<RoyaltyLine[]>;
  findByPeriod(period: string): Promise<RoyaltyLine[]>;
  saveBatch(lines: RoyaltyLine[]): Promise<void>;
}
