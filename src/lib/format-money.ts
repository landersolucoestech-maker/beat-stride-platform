function groupInteger(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatDecimalPtBr(value: string, fractionDigits = 2): string {
  const normalized = value.trim();
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [integerPart = "0", fractionPart = ""] = unsigned.split(".");
  const integer = integerPart.replace(/^0+(?=\d)/, "") || "0";
  const fraction = `${fractionPart}${"0".repeat(fractionDigits)}`.slice(0, fractionDigits);
  return `${negative ? "-" : ""}${groupInteger(integer)}${fractionDigits > 0 ? `,${fraction}` : ""}`;
}

export function formatMoneyPtBr(amount: string, currency: string): string {
  const prefix = currency === "BRL" ? "R$" : currency;
  return `${prefix} ${formatDecimalPtBr(amount, 2)}`;
}
