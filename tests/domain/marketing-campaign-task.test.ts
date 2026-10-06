import { describe, expect, it } from "vitest";

import { MarketingCampaignTask } from "../../packages/modules/marketing/domain/MarketingCampaignTask";

const now = new Date("2026-10-06T12:00:00.000Z");

describe("Marketing campaign task", () => {
  it("moves through planning lifecycle", () => {
    const task = MarketingCampaignTask.create({
      id: "task-1",
      organizationId: "org-1",
      campaignId: "campaign-1",
      phase: "PRE_RELEASE",
      category: "CONTENT",
      title: "Publicar teaser",
      description: null,
      assigneeUserId: null,
      dueAt: new Date("2026-10-20T12:00:00.000Z"),
      sortOrder: 0,
      now,
    });

    task.start(now);
    task.complete(now);

    expect(task.snapshot().status).toBe("DONE");
    expect(task.snapshot().completedAt).toEqual(now);
  });

  it("does not reopen a completed task implicitly", () => {
    const task = MarketingCampaignTask.create({
      id: "task-2",
      organizationId: "org-1",
      campaignId: "campaign-1",
      phase: "POST_RELEASE",
      category: "PLAYLIST",
      title: "Revisar playlists",
      description: null,
      assigneeUserId: null,
      dueAt: null,
      sortOrder: 1,
      now,
    });

    task.complete(now);

    expect(() => task.start(now)).toThrow("MARKETING_TASK_STATE_TRANSITION_INVALID");
  });
});
