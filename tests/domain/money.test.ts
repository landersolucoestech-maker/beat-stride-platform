import { describe, expect, it } from "vitest";

import { Money } from "../../packages/modules/shared/domain/Money";

describe("Money", () => {
  it("adds exact decimal values without floating point drift", () => {
    const total = Money.of("0.1", "BRL").add(Money.of("0.2", "BRL"));
    expect(total.toJSON()).toEqual({ amount: "0.3", currency: "BRL" });
  });

  it("aligns decimal scales exactly", () => {
    const total = Money.of("10.2500", "USD").subtract(Money.of("0.25", "USD"));
    expect(total.toJSON()).toEqual({ amount: "10", currency: "USD" });
  });

  it("rejects cross-currency arithmetic", () => {
    expect(() => Money.of("1", "BRL").add(Money.of("1", "USD"))).toThrow("MONEY_CURRENCY_MISMATCH");
  });
});
