export interface WalletProjectionProps {
  organizationId: string;
  currency: string;
  ledgerBalance: string;
  heldAmount: string;
  reservedAmount: string;
  payableAmount: string;
  updatedAt: Date;
}

export class WalletProjection {
  private constructor(private readonly props: WalletProjectionProps) {}
  static restore(props: WalletProjectionProps): WalletProjection { return new WalletProjection(props); }
  snapshot(): Readonly<WalletProjectionProps> { return { ...this.props }; }
}
