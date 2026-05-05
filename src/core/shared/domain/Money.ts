/**
 * Value Object representando valor monetário em uma moeda específica.
 * Imutável: operações retornam novas instâncias.
 */
export class Money {
  constructor(public readonly amount: number, public readonly currency: string = "BRL") {
    if (Number.isNaN(amount)) throw new Error("Money: amount inválido");
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  format(locale = "pt-BR"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.currency,
    }).format(this.amount);
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency)
      throw new Error(`Money: moedas diferentes ${this.currency} vs ${other.currency}`);
  }
}
