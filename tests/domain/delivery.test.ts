import { describe, expect, it } from "vitest";

import { Delivery, deriveReleaseDistributionStatus } from "../../packages/modules/distribution/domain/Delivery";

const now = new Date("2026-10-03T12:00:00.000Z");

function createDelivery(id: string, destinationCode: string) {
  return Delivery.create({
    id,
    organizationId: "org-1",
    releaseId: "release-1",
    releaseVersion: 1,
    providerCode: "provider",
    destinationCode,
    now,
  });
}

describe("Delivery", () => {
  it("derives a partially live release from destination states", () => {
    const live = createDelivery("delivery-1", "destination-a");
    live.applyProviderState({ next: "VALIDATING", providerStatus: "VALIDATING", now });
    live.applyProviderState({ next: "SENT", providerStatus: "SENT", now });
    live.applyProviderState({ next: "PROCESSING", providerStatus: "PROCESSING", now });
    live.applyProviderState({ next: "LIVE", providerStatus: "LIVE", now });

    const pending = createDelivery("delivery-2", "destination-b");

    expect(deriveReleaseDistributionStatus([live.snapshot(), pending.snapshot()])).toBe("PARTIALLY_LIVE");
  });

  it("rejects invalid destination state jumps", () => {
    const delivery = createDelivery("delivery-3", "destination-c");
    expect(() => delivery.applyProviderState({ next: "LIVE", providerStatus: "LIVE", now })).toThrow("DELIVERY_STATE_TRANSITION_INVALID");
  });
});
