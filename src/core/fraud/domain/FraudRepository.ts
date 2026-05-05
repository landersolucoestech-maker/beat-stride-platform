import { FraudAlert } from "./FraudAlert";

export interface FraudRepository {
  findAll(): Promise<FraudAlert[]>;
  save(a: FraudAlert): Promise<void>;
}
