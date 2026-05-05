import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Money } from "@/core/shared/domain/Money";

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed";
export type PayoutMethod = "pix" | "bank_transfer" | "paypal" | "wise";

export interface WithdrawalProps {
  artistId: string;
  artistName: string;
  amount: Money;
  method: PayoutMethod;
  status: WithdrawalStatus;
  requestedAt: string;
  completedAt?: string;
}

export class Withdrawal extends Entity<WithdrawalProps> {
  static create(props: WithdrawalProps, id?: UniqueId) {
    if (props.amount.amount <= 0) throw new Error("Withdrawal: valor deve ser positivo");
    return new Withdrawal(props, id);
  }

  approve() { (this.props as any).status = "processing"; }
  complete(when: string) {
    (this.props as any).status = "completed";
    (this.props as any).completedAt = when;
  }
  fail() { (this.props as any).status = "failed"; }

  get artistId() { return this.props.artistId; }
  get artistName() { return this.props.artistName; }
  get amount() { return this.props.amount; }
  get method() { return this.props.method; }
  get status() { return this.props.status; }
  get requestedAt() { return this.props.requestedAt; }
  get completedAt() { return this.props.completedAt; }
}
