import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
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
  startsAt: z.string().datetime({ offset: true }).nullable().optional(),
  endsAt: z.string().datetime({ offset: true }).nullable().optional(),
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
        releaseId,
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
        campaignId,
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
      campaignId,
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
      contentId,
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
