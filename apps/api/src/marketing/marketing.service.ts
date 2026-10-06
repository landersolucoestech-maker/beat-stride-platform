import { randomUUID } from "node:crypto";

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type MarketingCampaignType =
  | "PRE_SAVE"
  | "DSP_PITCH"
  | "PROMOTION"
  | "PLAYLIST_TRACKING"
  | "CONTENT_PROMOTION";

type MarketingContentType =
  | "TEASER"
  | "TRAILER"
  | "MUSIC_VIDEO"
  | "VISUALIZER"
  | "LYRIC_VIDEO"
  | "SHORT_VIDEO"
  | "REEL"
  | "TIKTOK"
  | "YOUTUBE_SHORT"
  | "STORY"
  | "FEED_POST"
  | "CAROUSEL"
  | "BEHIND_THE_SCENES"
  | "AUDIO_SNIPPET"
  | "ANNOUNCEMENT"
  | "OTHER";

type MarketingPublicationChannel =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "YOUTUBE"
  | "YOUTUBE_SHORTS";

type MarketingAssetType = "MARKETING_IMAGE" | "MARKETING_VIDEO" | "MARKETING_AUDIO";

interface MarketingReleaseRow extends QueryResultRow {
  id: string;
  title: string;
  artist_name: string | null;
  release_date: string | null;
}

interface SmartLinkRow extends QueryResultRow {
  id: string;
  title: string;
  slug: string;
  destinations: Array<{ code: string; label: string }> | null;
}

interface CampaignRow extends QueryResultRow {
  id: string;
  release_id: string;
  release_title: string;
  campaign_type: MarketingCampaignType;
  status: "DRAFT" | "READY" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  starts_at: Date | null;
  ends_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface ContentRow extends QueryResultRow {
  id: string;
  campaign_id: string;
  recording_id: string | null;
  recording_title: string | null;
  asset_id: string | null;
  asset_file_name: string | null;
  asset_status: string | null;
  asset_content_type: string | null;
  asset_byte_size: string | null;
  content_type: MarketingContentType;
  title: string;
  notes: string | null;
  status: "DRAFT" | "READY" | "ARCHIVED";
  created_at: Date;
  updated_at: Date;
  publications: Array<{
    id: string;
    channel: MarketingPublicationChannel;
    status: string;
    scheduledFor: string | null;
    publishedAt: string | null;
    externalUrl: string | null;
    lastErrorCode: string | null;
  }> | null;
}

@Injectable()
export class MarketingService {
  constructor(private readonly database: DatabaseService) {}

  async getOverview(organizationId: string) {
    const releases = await this.database.query<MarketingReleaseRow>(
      `SELECT
         release.id,
         release.title,
         primary_artist.canonical_name AS artist_name,
         metadata.release_date::text AS release_date
       FROM releases release
       LEFT JOIN release_metadata_versions metadata
         ON metadata.release_id = release.id
        AND metadata.release_version = release.current_version
       LEFT JOIN LATERAL (
         SELECT artist.canonical_name
         FROM release_artist_credits credit
         JOIN artist_identities artist ON artist.id = credit.artist_identity_id
         WHERE credit.release_id = release.id
           AND credit.credit_role = 'PRIMARY'
         ORDER BY credit.display_order ASC
         LIMIT 1
       ) primary_artist ON TRUE
       WHERE release.organization_id = $1
       ORDER BY release.updated_at DESC, release.id DESC
       LIMIT 200`,
      [organizationId],
    );

    return {
      available: true,
      releases: releases.rows.map((row) => ({
        id: row.id,
        title: row.title,
        artistName: row.artist_name ?? "",
        releaseDate: row.release_date,
      })),
      actions: [
        { code: "PRE_SAVE", label: "Pré-save", description: "Prepare uma ação de pré-save vinculada ao lançamento.", enabled: false },
        { code: "DSP_PITCH", label: "Pitch para DSPs", description: "Organize o contexto editorial do lançamento para pitch.", enabled: false },
        { code: "PROMOTION", label: "Promoção", description: "Estruture uma ação promocional vinculada ao catálogo.", enabled: false },
        { code: "PLAYLIST_TRACKING", label: "Monitoramento de playlists", description: "Acompanhe sinais de playlists quando a fonte de dados estiver conectada.", enabled: false },
      ],
    };
  }

  async listCampaigns(organizationId: string, releaseId?: string) {
    const result = await this.database.query<CampaignRow>(
      `SELECT
         campaign.id,
         campaign.release_id,
         release.title AS release_title,
         campaign.campaign_type,
         campaign.status,
         campaign.starts_at,
         campaign.ends_at,
         campaign.created_at,
         campaign.updated_at
       FROM marketing_campaigns campaign
       JOIN releases release ON release.id = campaign.release_id
       WHERE campaign.organization_id = $1
         AND ($2::uuid IS NULL OR campaign.release_id = $2::uuid)
       ORDER BY campaign.updated_at DESC, campaign.id DESC`,
      [organizationId, releaseId ?? null],
    );

    return result.rows.map((row) => this.mapCampaign(row));
  }

  async createCampaign(input: {
    organizationId: string;
    releaseId: string;
    campaignType: MarketingCampaignType;
    startsAt?: string | null | undefined;
    endsAt?: string | null | undefined;
  }) {
    const release = await this.database.query<{ id: string } & QueryResultRow>(
      `SELECT id
       FROM releases
       WHERE organization_id = $1 AND id = $2
       LIMIT 1`,
      [input.organizationId, input.releaseId],
    );
    if (!release.rows[0]) {
      throw new NotFoundException({
        code: "MARKETING_RELEASE_NOT_FOUND",
        message: "Release not found for active organization",
      });
    }

    const startsAt = input.startsAt ? new Date(input.startsAt) : null;
    const endsAt = input.endsAt ? new Date(input.endsAt) : null;
    if (startsAt && endsAt && endsAt <= startsAt) {
      throw new BadRequestException({
        code: "MARKETING_CAMPAIGN_PERIOD_INVALID",
        message: "Campaign end must be after campaign start",
      });
    }

    const id = randomUUID();
    const now = new Date();
    await this.database.query(
      `INSERT INTO marketing_campaigns
         (id, organization_id, release_id, campaign_type, status, starts_at, ends_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6, $7, $7)`,
      [id, input.organizationId, input.releaseId, input.campaignType, startsAt, endsAt, now],
    );

    return this.mapCampaign(await this.requireCampaign(input.organizationId, id));
  }

  async listCampaignContents(organizationId: string, campaignId: string) {
    await this.requireCampaign(organizationId, campaignId);

    const result = await this.database.query<ContentRow>(
      `SELECT
         content.id,
         content.campaign_id,
         content.recording_id,
         recording.title AS recording_title,
         content.asset_id,
         asset.file_name AS asset_file_name,
         asset.status AS asset_status,
         asset.content_type AS asset_content_type,
         asset.byte_size::text AS asset_byte_size,
         content.content_type,
         content.title,
         content.notes,
         content.status,
         content.created_at,
         content.updated_at,
         COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'id', publication.id,
               'channel', publication.channel_code,
               'status', publication.status,
               'scheduledFor', publication.scheduled_for,
               'publishedAt', publication.published_at,
               'externalUrl', publication.external_url,
               'lastErrorCode', publication.last_error_code
             )
             ORDER BY publication.created_at ASC
           ) FILTER (WHERE publication.id IS NOT NULL),
           '[]'::jsonb
         ) AS publications
       FROM marketing_campaign_contents content
       LEFT JOIN recordings recording ON recording.id = content.recording_id
       LEFT JOIN assets asset ON asset.id = content.asset_id
       LEFT JOIN marketing_content_publications publication ON publication.content_id = content.id
       WHERE content.organization_id = $1
         AND content.campaign_id = $2
         AND content.status <> 'ARCHIVED'
       GROUP BY
         content.id,
         content.campaign_id,
         content.recording_id,
         recording.title,
         content.asset_id,
         asset.file_name,
         asset.status,
         asset.content_type,
         asset.byte_size,
         content.content_type,
         content.title,
         content.notes,
         content.status,
         content.created_at,
         content.updated_at
       ORDER BY content.updated_at DESC, content.id DESC`,
      [organizationId, campaignId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      recordingId: row.recording_id,
      recordingTitle: row.recording_title,
      assetId: row.asset_id,
      assetFileName: row.asset_file_name,
      assetStatus: row.asset_status,
      assetContentType: row.asset_content_type,
      assetByteSize: row.asset_byte_size,
      contentType: row.content_type,
      title: row.title,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      publications: row.publications ?? [],
    }));
  }

  async createCampaignContent(input: {
    organizationId: string;
    campaignId: string;
    recordingId?: string | null | undefined;
    assetId?: string | null | undefined;
    contentType: MarketingContentType;
    title: string;
    notes?: string | null | undefined;
  }) {
    const campaign = await this.requireCampaign(input.organizationId, input.campaignId);
    if (campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
      throw new BadRequestException({
        code: "MARKETING_CAMPAIGN_NOT_EDITABLE",
        message: "Completed or cancelled campaigns cannot receive new content",
      });
    }

    if (input.recordingId) {
      const recording = await this.database.query<{ id: string } & QueryResultRow>(
        `SELECT recording.id
         FROM recordings recording
         JOIN tracks track ON track.recording_id = recording.id
         WHERE recording.organization_id = $1
           AND recording.id = $2
           AND track.release_id = $3
         LIMIT 1`,
        [input.organizationId, input.recordingId, campaign.release_id],
      );
      if (!recording.rows[0]) {
        throw new BadRequestException({
          code: "MARKETING_RECORDING_RELEASE_MISMATCH",
          message: "Recording must belong to the campaign release",
        });
      }
    }

    if (input.assetId) {
      const asset = await this.database.query<{ id: string; status: string } & QueryResultRow>(
        `SELECT id, status
         FROM assets
         WHERE organization_id = $1 AND id = $2
         LIMIT 1`,
        [input.organizationId, input.assetId],
      );
      const row = asset.rows[0];
      if (!row) {
        throw new BadRequestException({
          code: "MARKETING_ASSET_NOT_FOUND",
          message: "Asset must belong to the active organization",
        });
      }
      if (row.status !== "AVAILABLE") {
        throw new BadRequestException({
          code: "MARKETING_ASSET_NOT_AVAILABLE",
          message: "Only available assets may be attached to campaign content",
        });
      }
    }

    const id = randomUUID();
    const now = new Date();
    await this.database.query(
      `INSERT INTO marketing_campaign_contents
         (id, organization_id, campaign_id, recording_id, asset_id, content_type, title, notes, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT', $9, $9)`,
      [
        id,
        input.organizationId,
        input.campaignId,
        input.recordingId ?? null,
        input.assetId ?? null,
        input.contentType,
        input.title.trim(),
        input.notes?.trim() || null,
        now,
      ],
    );

    return {
      id,
      campaignId: input.campaignId,
      recordingId: input.recordingId ?? null,
      assetId: input.assetId ?? null,
      contentType: input.contentType,
      title: input.title.trim(),
      notes: input.notes?.trim() || null,
      status: "DRAFT" as const,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      publications: [],
    };
  }

  async registerContentAsset(input: {
    organizationId: string;
    contentId: string;
    fileName: string;
    contentType: string;
    byteSize: number;
  }) {
    const content = await this.database.query<
      {
        id: string;
        asset_id: string | null;
        status: "DRAFT" | "READY" | "ARCHIVED";
        campaign_status: string;
      } & QueryResultRow
    >(
      `SELECT
         content.id,
         content.asset_id,
         content.status,
         campaign.status AS campaign_status
       FROM marketing_campaign_contents content
       JOIN marketing_campaigns campaign ON campaign.id = content.campaign_id
       WHERE content.organization_id = $1
         AND content.id = $2
         AND campaign.organization_id = $1
       LIMIT 1`,
      [input.organizationId, input.contentId],
    );

    const row = content.rows[0];
    if (!row) {
      throw new NotFoundException({
        code: "MARKETING_CONTENT_NOT_FOUND",
        message: "Campaign content not found for active organization",
      });
    }
    if (row.status === "ARCHIVED" || ["COMPLETED", "CANCELLED"].includes(row.campaign_status)) {
      throw new BadRequestException({
        code: "MARKETING_CONTENT_NOT_EDITABLE",
        message: "Promotional asset cannot be attached to archived content or a closed campaign",
      });
    }
    if (row.asset_id) {
      throw new BadRequestException({
        code: "MARKETING_CONTENT_ASSET_ALREADY_ATTACHED",
        message: "Campaign content already has a primary promotional asset",
      });
    }

    const assetType = this.resolveMarketingAssetType(input.contentType, input.byteSize);
    const assetId = randomUUID();
    const now = new Date();
    const storageKey = `marketing/${input.organizationId}/${input.contentId}/${assetId}`;

    await this.database.transaction(async (client) => {
      await client.query(
        `INSERT INTO assets
          (id, organization_id, asset_type, status, storage_key, file_name, content_type, byte_size, checksum_sha256, created_at, updated_at)
         VALUES ($1, $2, $3, 'PENDING_UPLOAD', $4, $5, $6, $7, NULL, $8, $8)`,
        [
          assetId,
          input.organizationId,
          assetType,
          storageKey,
          input.fileName.trim(),
          input.contentType.trim().toLowerCase(),
          input.byteSize,
          now,
        ],
      );

      await client.query(
        `UPDATE marketing_campaign_contents
         SET asset_id = $3, updated_at = $4
         WHERE organization_id = $1 AND id = $2`,
        [input.organizationId, input.contentId, assetId, now],
      );
    });

    return {
      asset: {
        id: assetId,
        type: assetType,
        status: "PENDING_UPLOAD" as const,
        fileName: input.fileName.trim(),
        contentType: input.contentType.trim().toLowerCase(),
        byteSize: input.byteSize,
        storageKey,
      },
      upload: {
        available: false,
        reason: "ASSET_STORAGE_NOT_CONFIGURED",
        method: null,
        url: null,
        headers: {},
        expiresAt: null,
      },
    };
  }

  async createPublicationPlan(input: {
    organizationId: string;
    contentId: string;
    channel: MarketingPublicationChannel;
    scheduledFor?: string | null | undefined;
  }) {
    const content = await this.database.query<
      { id: string; status: "DRAFT" | "READY" | "ARCHIVED"; campaign_status: string } & QueryResultRow
    >(
      `SELECT content.id, content.status, campaign.status AS campaign_status
       FROM marketing_campaign_contents content
       JOIN marketing_campaigns campaign ON campaign.id = content.campaign_id
       WHERE content.organization_id = $1
         AND content.id = $2
         AND campaign.organization_id = $1
       LIMIT 1`,
      [input.organizationId, input.contentId],
    );
    const row = content.rows[0];
    if (!row) {
      throw new NotFoundException({
        code: "MARKETING_CONTENT_NOT_FOUND",
        message: "Campaign content not found for active organization",
      });
    }
    if (row.status === "ARCHIVED" || ["COMPLETED", "CANCELLED"].includes(row.campaign_status)) {
      throw new BadRequestException({
        code: "MARKETING_CONTENT_NOT_EDITABLE",
        message: "Publication cannot be planned for archived content or a closed campaign",
      });
    }

    const now = new Date();
    const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null;
    if (scheduledFor && scheduledFor <= now) {
      throw new BadRequestException({
        code: "MARKETING_PUBLICATION_SCHEDULE_INVALID",
        message: "Scheduled publication time must be in the future",
      });
    }

    const id = randomUUID();
    const status = scheduledFor ? "SCHEDULED" : "PLANNED";
    await this.database.query(
      `INSERT INTO marketing_content_publications
         (id, organization_id, content_id, channel_code, status, scheduled_for, published_at,
          external_publication_id, external_url, last_error_code, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL, NULL, $7, $7)`,
      [id, input.organizationId, input.contentId, input.channel, status, scheduledFor, now],
    );

    return {
      id,
      contentId: input.contentId,
      channel: input.channel,
      status,
      scheduledFor: scheduledFor?.toISOString() ?? null,
      publishedAt: null,
      externalUrl: null,
      lastErrorCode: null,
      providerExecutionAvailable: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getSmartLinks(organizationId: string) {
    const result = await this.database.query<SmartLinkRow>(
      `SELECT
         smart_link.id,
         smart_link.title,
         smart_link.slug,
         COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'code', destination.destination_code,
               'label', destination.destination_code
             ) ORDER BY destination.position ASC
           ) FILTER (WHERE destination.id IS NOT NULL),
           '[]'::jsonb
         ) AS destinations
       FROM marketing_smart_links smart_link
       LEFT JOIN marketing_smart_link_destinations destination ON destination.smart_link_id = smart_link.id
       WHERE smart_link.organization_id = $1
         AND smart_link.status <> 'ARCHIVED'
       GROUP BY smart_link.id, smart_link.title, smart_link.slug, smart_link.updated_at
       ORDER BY smart_link.updated_at DESC, smart_link.id DESC`,
      [organizationId],
    );

    return {
      available: true,
      items: result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        artworkUrl: null,
        publicUrl: null,
        destinations: row.destinations ?? [],
        visits: null,
        conversions: null,
        conversionRate: null,
      })),
    };
  }

  getFanList() {
    return {
      available: false,
      summary: { totalContacts: null, subscribedContacts: null, unsubscribedContacts: null, lastUpdatedAt: null },
      sources: [],
    };
  }

  getTools() {
    return { available: false, items: [] };
  }

  private resolveMarketingAssetType(contentType: string, byteSize: number): MarketingAssetType {
    const normalized = contentType.trim().toLowerCase();
    const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    const videoTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);
    const audioTypes = new Set([
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/flac",
      "audio/aac",
      "audio/mp4",
    ]);

    if (imageTypes.has(normalized)) {
      if (byteSize > 50 * 1024 * 1024) {
        throw new BadRequestException({
          code: "MARKETING_ASSET_TOO_LARGE",
          message: "Marketing images may not exceed 50 MiB",
        });
      }
      return "MARKETING_IMAGE";
    }

    if (videoTypes.has(normalized)) {
      if (byteSize > 5 * 1024 * 1024 * 1024) {
        throw new BadRequestException({
          code: "MARKETING_ASSET_TOO_LARGE",
          message: "Marketing videos may not exceed 5 GiB",
        });
      }
      return "MARKETING_VIDEO";
    }

    if (audioTypes.has(normalized)) {
      if (byteSize > 500 * 1024 * 1024) {
        throw new BadRequestException({
          code: "MARKETING_ASSET_TOO_LARGE",
          message: "Marketing audio may not exceed 500 MiB",
        });
      }
      return "MARKETING_AUDIO";
    }

    throw new BadRequestException({
      code: "MARKETING_ASSET_CONTENT_TYPE_UNSUPPORTED",
      message: "Promotional asset content type is not supported",
    });
  }

  private async requireCampaign(organizationId: string, campaignId: string): Promise<CampaignRow> {
    const result = await this.database.query<CampaignRow>(
      `SELECT
         campaign.id,
         campaign.release_id,
         release.title AS release_title,
         campaign.campaign_type,
         campaign.status,
         campaign.starts_at,
         campaign.ends_at,
         campaign.created_at,
         campaign.updated_at
       FROM marketing_campaigns campaign
       JOIN releases release ON release.id = campaign.release_id
       WHERE campaign.organization_id = $1
         AND campaign.id = $2
       LIMIT 1`,
      [organizationId, campaignId],
    );
    const campaign = result.rows[0];
    if (!campaign) {
      throw new NotFoundException({
        code: "MARKETING_CAMPAIGN_NOT_FOUND",
        message: "Marketing campaign not found for active organization",
      });
    }
    return campaign;
  }

  private mapCampaign(row: CampaignRow) {
    return {
      id: row.id,
      releaseId: row.release_id,
      releaseTitle: row.release_title,
      campaignType: row.campaign_type,
      status: row.status,
      startsAt: row.starts_at?.toISOString() ?? null,
      endsAt: row.ends_at?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
