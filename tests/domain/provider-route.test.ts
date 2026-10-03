import { describe, expect, it } from "vitest";

import { ProviderRoute } from "../../packages/modules/distribution/domain/ProviderRoute";

describe("ProviderRoute", () => {
  const route = ProviderRoute.create({
    providerCode: "provider-a",
    capabilities: new Set(["DELIVERY", "UPDATE"]),
    destinations: new Set(["DSP_A", "DSP_B"]),
    territories: new Set(["BR", "US"]),
    health: "HEALTHY",
    enabled: true,
  });

  it("accepts only declared capabilities, destinations and territories", () => {
    expect(route.evaluate({ capability: "DELIVERY", destinationCode: "DSP_A", territoryCode: "BR" })).toEqual({ eligible: true });
  });

  it("rejects undeclared provider capabilities", () => {
    expect(route.evaluate({ capability: "TAKEDOWN", destinationCode: "DSP_A", territoryCode: "BR" })).toEqual({
      eligible: false,
      reason: "PROVIDER_CAPABILITY_UNSUPPORTED",
    });
  });
});
