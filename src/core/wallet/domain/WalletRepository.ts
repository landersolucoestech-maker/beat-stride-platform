import { Wallet } from "./Wallet";
import { Withdrawal } from "./Withdrawal";

export interface WalletRepository {
  findByArtistId(artistId: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<void>;
}

export interface WithdrawalRepository {
  findAll(): Promise<Withdrawal[]>;
  findByArtistId(artistId: string): Promise<Withdrawal[]>;
  save(w: Withdrawal): Promise<void>;
}
