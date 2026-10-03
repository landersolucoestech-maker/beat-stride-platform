import { describe, expect, it } from "vitest";

import { Release } from "../../packages/modules/catalog/domain/Release";

const now = new Date("2026-10-03T12:00:00.000Z");

describe("Release lifecycle", () => {
  it("follows the submission and approval path", () => {
    const release = Release.createDraft({
      id: "release-1",
      organizationId: "org-1",
      title: "Release",
      type: "SINGLE",
      now,
    });

    release.markReadyForSubmission(now);
    release.submit(now);
    release.startValidation(now);
    release.approve(now);
    release.startDistribution(now);
    release.markLive(now);

    expect(release.snapshot().status).toBe("LIVE");
  });

  it("rejects invalid jumps", () => {
    const release = Release.createDraft({
      id: "release-2",
      organizationId: "org-1",
      title: "Release",
      type: "ALBUM",
      now,
    });

    expect(() => release.approve(now)).toThrow("RELEASE_STATE_TRANSITION_INVALID");
  });
});
