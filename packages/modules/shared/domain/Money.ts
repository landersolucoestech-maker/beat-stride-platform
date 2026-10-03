const DECIMAL_PATTERN = /^-?\d+(?:\.\d+)?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export interface MoneyValue {
  amount: string;
  currency: string;
}

export class Money {
  private constructor(readonly amount: string, readonly currency: string) {}

  static of(amount: string, currency: string): Money {
    if (!DECIMAL_PATTERN.test(amount)) throw new Error("MONEY_AMOUNT_INVALID");
    if (!CURRENCY_PATTERN.test(currency)) throw new Error("MONEY_CURRENCY_INVALID");
    return new Money(amount, currency);
  }

  toJSON(): MoneyValue { return { amount: this.amount, currency: this.currency }; }
}
