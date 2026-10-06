import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { MarketingService } from "./marketing.service.js";

const campaignTypeSchema = z.enum([
  "PRE_SAVE",
  "DSP_PITCH",
  "PROMOTION",
  "PLAYLIST_TRACKING",
  "CONTENT_PROMOTION",
]);

const contentTypeSchema = z.enum([
  "TEASER",
  "TRAILER",
  "MUSIC_VIDEO",
  "VISUALIZER",
  "LYRIC_VIDEO",
  "SHORT_VIDEO",
  "REEL",
  "TIKTOK",
  "YOUTUBE_SHORT",
  "STORY",
  "FEED_POST",
  "CAROUSEL",
  "BEHIND_THE_SCENES",
  "AUDIO_SNIPPET",
  "ANNOUNCEMENT",
  "OTHER",
]);

const publicationChannelSchema = z.enum([
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "YOUTUBE",
  "YOUTUBE_SHORTS",
]);

const createCampaignSchema = z.object({
  releaseId: z.string().uuid(),
  campaignType: campaignTypeSchema,
  name: z.string().trim().min(1).max(240).optional(),
  objective: z.string().trim().max(1000).nullable().optional(),
  focusRecordingId: z.string().uuid().nullable().optional(),
  brief: z.string().trim().max(8000).nullable().optional(),
  budgetMinor: z.number().int().nonnegative().nullable().optional(),
  budgetCurrency: z.string().trim().regex(/^[A-Z]{3}$/).nullable().optional(),
  startsAt: z.string().datetime({ offset: true }).nullable().optional(),
  endsAt: z.string().datetime({ offset: true }).nullable().optional(),
});

const campaignTaskSchema = z.object({
  phase: z.enum(["PRE_RELEASE", "RELEASE_DAY", "POST_RELEASE", "ONGOING"]),
  category: z.enum([
    "CONTENT",
    "DSP",
    "SMART_LINK",
    "SOCIAL",
    "ADS",
    "CREATORS",
    "AUDIENCE",
    "PLAYLIST",
    "OTHER",
  ]),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(4000).nullable().optional(),
  assigneeUserId: z.string().uuid().nullable().optional(),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

const taskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]),
});

const createContentSchema = z.object({
  recordingId: z.string().uuid().nullable().optional(),
  assetId: z.string().uuid().nullable().optional(),
  contentType: contentTypeSchema,
  title: z.string().trim().min(1).max(240),
  notes: z.string().trim().max(4000).nullable().optional(),
});

const createPublicationSchema = z.object({
  channel: publicationChannelSchema,
  scheduledFor: z.string().datetime({ offset: true }).nullable().optional(),
});

const registerContentAssetSchema = z.object({
  fileName: z.string().trim().min(1).max(512),
  contentType: z.string().trim().min(1).max(160),
  byteSize: z.number().int().positive().max(5 * 1024 * 1024 * 1024),
});

const smartLinkDestinationSchema = z.object({
  code: z.string().trim().min(1).max(64).regex(/^[A-Z0-9_]+$/),
  url: z.string().url().refine((value) => value.startsWith("https://"), {
    message: "Destination URL must use HTTPS",
  }),
});

const createSmartLinkSchema = z.object({
  releaseId: z.string().uuid(),
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  linkType: z.enum(["SMART_LINK", "PRE_SAVE"]),
  destinations: z.array(smartLinkDestinationSchema).min(1).max(20),
  activate: z.boolean().default(true),
}).superRefine((value, context) => {
  const codes = new Set<string>();
  for (const [index, destination] of value.destinations.entries()) {
    if (codes.has(destination.code)) {
      context.addIssue({
        code: "custom",
        path: ["destinations", index, "code"],
        message: "Destination codes must be unique",
      });
    }
    codes.add(destination.code);
  }
});

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "Request body is invalid",
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  return parsed.data;
}

function parseUuid(value: string, field: string): string {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: `${field} must be a valid UUID`,
    });
  }
  return parsed.data;
}

@ApiTags("marketing")
@ApiBearerAuth()
@Controller("marketing")
export class MarketingController {
  constructor(
    private readonly marketing: MarketingService,
    private readonly sessions: SessionService,
  ) {}

  @Get("overview")
  @ApiOperation({ summary: "Get native marketing overview for the active organization" })
  async overview(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return this.marketing.getOverview(context.activeOrganization.organizationId);
  }

  @Get("campaigns")
  @ApiOperation({ summary: "List native marketing campaigns for the active organization" })
  async campaigns(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Query("releaseId") releaseId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return {
      items: await this.marketing.listCampaigns(
        context.activeOrganization.organizationId,
        releaseId ? parseUuid(releaseId, "releaseId") : undefined,
      ),
    };
  }

  @Post("campaigns")
  @ApiOperation({ summary: "Create a release-scoped native marketing campaign" })
  @ApiResponse({ status: 201, description: "Marketing campaign created" })
  async createCampaign(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.manage");
    const input = parseBody(createCampaignSchema, body);
    return this.marketing.createCampaign({
      ...input,
      organizationId: context.activeOrganization.organizationId,
    });
  }

  @Get("campaigns/:campaignId/tasks")
  @ApiOperation({ summary: "List campaign plan tasks" })
  async campaignTasks(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("campaignId") campaignId: string,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return {
      items: await this.marketing.listCampaignTasks(
        context.activeOrganization.organizationId,
        parseUuid(campaignId, "campaignId"),
      ),
    };
  }

  @Post("campaigns/:campaignId/tasks")
  @ApiOperation({ summary: "Create a campaign plan task" })
  @ApiResponse({ status: 201, description: "Campaign task created" })
  async createCampaignTask(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("campaignId") campaignId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.manage");
    const input = parseBody(campaignTaskSchema, body);
    return this.marketing.createCampaignTask({
      ...input,
      campaignId: parseUuid(campaignId, "campaignId"),
      organizationId: context.activeOrganization.organizationId,
    });
  }

  @Patch("tasks/:taskId/status")
  @ApiOperation({ summary: "Update a campaign task status" })
  async updateCampaignTaskStatus(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("taskId") taskId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.manage");
    const input = parseBody(taskStatusSchema, body);
    return this.marketing.updateCampaignTaskStatus({
      organizationId: context.activeOrganization.organizationId,
      taskId: parseUuid(taskId, "taskId"),
      status: input.status,
    });
  }

  @Get("campaigns/:campaignId/calendar")
  @ApiOperation({ summary: "Get campaign calendar projection from tasks and planned publications" })
  async campaignCalendar(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("campaignId") campaignId: string,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return {
      items: await this.marketing.getCampaignCalendar(
        context.activeOrganization.organizationId,
        parseUuid(campaignId, "campaignId"),
      ),
    };
  }

  @Get("campaigns/:campaignId/contents")
  @ApiOperation({ summary: "List promotional contents and publication plans for a marketing campaign" })
  async campaignContents(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("campaignId") campaignId: string,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return {
      items: await this.marketing.listCampaignContents(
        context.activeOrganization.organizationId,
        parseUuid(campaignId, "campaignId"),
      ),
    };
  }

  @Post("campaigns/:campaignId/contents")
  @ApiOperation({ summary: "Create promotional content within a marketing campaign" })
  @ApiResponse({ status: 201, description: "Promotional content created" })
  async createCampaignContent(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("campaignId") campaignId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.manage");
    const input = parseBody(createContentSchema, body);
    return this.marketing.createCampaignContent({
      ...input,
      campaignId: parseUuid(campaignId, "campaignId"),
      organizationId: context.activeOrganization.organizationId,
    });
  }

  @Post("contents/:contentId/asset")
  @ApiOperation({ summary: "Reserve and attach a promotional asset upload to campaign content" })
  @ApiResponse({ status: 201, description: "Promotional asset upload reserved" })
  async registerContentAsset(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("contentId") contentId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.manage");
    const input = parseBody(registerContentAssetSchema, body);
    return this.marketing.registerContentAsset({
      ...input,
      contentId: parseUuid(contentId, "contentId"),
      organizationId: context.activeOrganization.organizationId,
    });
  }

  @Post("contents/:contentId/publications")
  @ApiOperation({ summary: "Plan or schedule publication of promotional content for a supported channel" })
  @ApiResponse({ status: 201, description: "Publication plan created" })
  async createPublication(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("contentId") contentId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.manage");
    const input = parseBody(createPublicationSchema, body);
    return this.marketing.createPublicationPlan({
      ...input,
      contentId: parseUuid(contentId, "contentId"),
      organizationId: context.activeOrganization.organizationId,
    });
  }

  @Post("smart-links")
  @ApiOperation({ summary: "Create a release-scoped Smart Link or pre-save landing page" })
  @ApiResponse({ status: 201, description: "Smart Link created" })
  async createSmartLink(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.manage");
    const input = parseBody(createSmartLinkSchema, body);
    return this.marketing.createSmartLink({
      ...input,
      organizationId: context.activeOrganization.organizationId,
    });
  }

  @Get("smart-links")
  @ApiOperation({ summary: "List Smart Links for the active organization" })
  async smartLinks(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return this.marketing.getSmartLinks(context.activeOrganization.organizationId);
  }

  @Get("fans")
  @ApiOperation({ summary: "Get fan contact projection when a consented source is configured" })
  async fans(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return this.marketing.getFanList();
  }

  @Get("tools")
  @ApiOperation({ summary: "Get enabled native marketing tools" })
  async tools(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    await this.sessions.requireOrganizationPermission(authorization, organizationId, "marketing.read");
    return this.marketing.getTools();
  }
}
