import { Money } from "../../shared/domain/Money";

export interface WalletProjectionProps {
  organizationId: string;
  currency: string;
  ledgerBalance: Money;
  heldAmount: Money;
  reservedAmount: Money;
  payableAmount: Money;
  updatedAt: Date;
}

export class WalletProjection {
  private constructor(private readonly props: WalletProjectionProps) {}

  static restore(props: WalletProjectionProps): WalletProjection {
    const values = [props.ledgerBalance, props.heldAmount, props.reservedAmount, props.payableAmount];
    if (values.some((value) => value.currency !== props.currency)) {
      throw new Error("WALLET_CURRENCY_MISMATCH");
    }
    if (props.heldAmount.isNegative() || props.reservedAmount.isNegative() || props.payableAmount.isNegative()) {
      throw new Error("WALLET_PROJECTION_AMOUNT_INVALID");
    }
    return new WalletProjection({ ...props });
  }

  hasPayableFunds(): boolean {
    return this.props.payableAmount.isPositive();
  }

  snapshot(): Readonly<WalletProjectionProps> {
    return { ...this.props };
  }
}
