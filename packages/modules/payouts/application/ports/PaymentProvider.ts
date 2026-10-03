export interface PaymentProviderTransferRequest {
  payoutId: string;
  payoutAccountReference: string;
  amount: string;
  currency: string;
  idempotencyKey: string;
  correlationId: string;
}

export interface PaymentProviderTransferResult {
  providerReference: string;
  status: "ACCEPTED" | "PROCESSING" | "PAID" | "FAILED";
  retryable: boolean;
  errorCode: string | null;
}

export interface PaymentProvider {
  readonly providerCode: string;
  supportedCountries(): ReadonlySet<string>;
  supportedCurrencies(): ReadonlySet<string>;
  createTransfer(request: PaymentProviderTransferRequest): Promise<PaymentProviderTransferResult>;
}
