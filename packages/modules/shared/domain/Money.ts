const DECIMAL_PATTERN = /^-?\d+(?:\.\d+)?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export interface MoneyValue {
  amount: string;
  currency: string;
}

interface ParsedDecimal {
  integer: bigint;
  scale: number;
}

function parseDecimal(value: string): ParsedDecimal {
  if (!DECIMAL_PATTERN.test(value)) throw new Error("MONEY_AMOUNT_INVALID");

  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole = "0", fraction = ""] = unsigned.split(".");
  const scale = fraction.length;
  const digits = `${whole}${fraction}`.replace(/^0+(?=\d)/, "") || "0";
  const integer = BigInt(digits) * (negative ? -1n : 1n);
  return { integer, scale };
}

function pow10(scale: number): bigint {
  return 10n ** BigInt(scale);
}

function align(left: ParsedDecimal, right: ParsedDecimal): [bigint, bigint, number] {
  const scale = Math.max(left.scale, right.scale);
  return [
    left.integer * pow10(scale - left.scale),
    right.integer * pow10(scale - right.scale),
    scale,
  ];
}

function formatDecimal(integer: bigint, scale: number): string {
  const negative = integer < 0n;
  const absolute = negative ? -integer : integer;
  const digits = absolute.toString().padStart(scale + 1, "0");

  if (scale === 0) return `${negative ? "-" : ""}${digits}`;

  const whole = digits.slice(0, -scale) || "0";
  const fraction = digits.slice(-scale).replace(/0+$/, "");
  const value = fraction ? `${whole}.${fraction}` : whole;
  if (value === "0") return "0";
  return `${negative ? "-" : ""}${value}`;
}

function normalizeDecimal(value: string): string {
  const parsed = parseDecimal(value);
  return formatDecimal(parsed.integer, parsed.scale);
}

export class Money {
  private constructor(readonly amount: string, readonly currency: string) {}

  static of(amount: string, currency: string): Money {
    if (!CURRENCY_PATTERN.test(currency)) throw new Error("MONEY_CURRENCY_INVALID");
    return new Money(normalizeDecimal(amount), currency);
  }

  static zero(currency: string): Money {
    return Money.of("0", currency);
  }

  add(other: Money): Money {
    this.assertCurrency(other);
    const [left, right, scale] = align(parseDecimal(this.amount), parseDecimal(other.amount));
    return Money.of(formatDecimal(left + right, scale), this.currency);
  }

  subtract(other: Money): Money {
    return this.add(other.negate());
  }

  negate(): Money {
    if (this.amount === "0") return this;
    return Money.of(this.amount.startsWith("-") ? this.amount.slice(1) : `-${this.amount}`, this.currency);
  }

  equals(other: Money): boolean {
    if (this.currency !== other.currency) return false;
    const [left, right] = align(parseDecimal(this.amount), parseDecimal(other.amount));
    return left === right;
  }

  compare(other: Money): -1 | 0 | 1 {
    this.assertCurrency(other);
    const [left, right] = align(parseDecimal(this.amount), parseDecimal(other.amount));
    return left < right ? -1 : left > right ? 1 : 0;
  }

  isZero(): boolean {
    return parseDecimal(this.amount).integer === 0n;
  }

  isPositive(): boolean {
    return parseDecimal(this.amount).integer > 0n;
  }

  isNegative(): boolean {
    return parseDecimal(this.amount).integer < 0n;
  }

  toJSON(): MoneyValue {
    return { amount: this.amount, currency: this.currency };
  }

  private assertCurrency(other: Money): void {
    if (this.currency !== other.currency) throw new Error("MONEY_CURRENCY_MISMATCH");
  }
}
