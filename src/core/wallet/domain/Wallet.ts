import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Money } from "@/core/shared/domain/Money";

/**
 * Aggregate root da Wallet — saldo disponível, pendente e métodos de pagamento.
 */
export interface WalletProps {
  artistId: string;
  available: Money;
  pending: Money;
  lifetimeEarnings: Money;
}

export class Wallet extends Entity<WalletProps> {
  static create(props: WalletProps, id?: UniqueId) {
    return new Wallet(props, id);
  }

  canWithdraw(amount: Money) {
    return this.props.available.amount >= amount.amount;
  }

  debit(amount: Money) {
    if (!this.canWithdraw(amount)) throw new Error("Saldo insuficiente");
    (this.props as any).available = this.props.available.subtract(amount);
  }

  credit(amount: Money) {
    (this.props as any).available = this.props.available.add(amount);
    (this.props as any).lifetimeEarnings = this.props.lifetimeEarnings.add(amount);
  }

  get artistId() { return this.props.artistId; }
  get available() { return this.props.available; }
  get pending() { return this.props.pending; }
  get lifetimeEarnings() { return this.props.lifetimeEarnings; }
}
