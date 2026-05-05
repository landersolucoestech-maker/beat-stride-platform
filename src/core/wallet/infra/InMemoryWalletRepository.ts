import { Wallet } from "../domain/Wallet";
import { Withdrawal } from "../domain/Withdrawal";
import { WalletRepository, WithdrawalRepository } from "../domain/WalletRepository";

export class InMemoryWalletRepository implements WalletRepository {
  private items: Map<string, Wallet> = new Map();
  async findByArtistId(artistId: string) {
    return Array.from(this.items.values()).find(w => w.artistId === artistId) ?? null;
  }
  async save(w: Wallet) { this.items.set(w.id.toString(), w); }
}

export class InMemoryWithdrawalRepository implements WithdrawalRepository {
  private items: Map<string, Withdrawal> = new Map();
  async findAll() { return Array.from(this.items.values()); }
  async findByArtistId(artistId: string) {
    return Array.from(this.items.values()).filter(w => w.artistId === artistId);
  }
  async save(w: Withdrawal) { this.items.set(w.id.toString(), w); }
}
