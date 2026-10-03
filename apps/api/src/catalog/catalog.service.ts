import { randomUUID } from "node:crypto";

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

export type CatalogReleaseType = "SINGLE" | "EP" | "ALBUM";
export type CatalogReleaseStatus =
  | "DRAFT"
  | "READY_FOR_SUBMISSION"
  | "SUBMITTED"
  | "VALIDATING"
  | "CORRECTION_REQUIRED"
  | "RESUBMITTED"
  | "AUTHORIZATION_REQUIRED"
  | "MANUAL_REVIEW"
  | "REJECTED"
  | "APPROVED"
  | "SCHEDULED"
  | "DISTRIBUTING"
  | "LIVE"
  | "PARTIALLY_LIVE"
  | "DISTRIBUTION_FAILED";

interface ReleaseListRow extends QueryResultRow {
  id: string;
  title: string;
  release_type: CatalogReleaseType;
  status: CatalogReleaseStatus;
  release_date: string | null;
  artist_name: string | null;
}

interface AssociatedArtistRow extends QueryResultRow {
  artist_identity_id: string;
}

export interface DraftTrackInput {
  title: string;
  explicit: boolean;
}

export interface ProvisionalSplitInput {
  name: string;
  role: "PRIMARY_ARTIST" | "FEATURED_ARTIST" | "PRODUCER" | "COMPOSER" | "OTHER";
  percentage: number;
}

export interface PendingFileInput {
  fileName: string;
  contentType: string;
  byteSize: number;
}

export interface CreateReleaseInput {
  organizationId: string;
  title: string;
  type: CatalogReleaseType;
  primaryArtistIdentityId: string;
  releaseDate: string;
  primaryGenre: string;
  explicit: boolean;
  tracks: DraftTrackInput[];
  provisionalSplits: ProvisionalSplitInput[];
  pendingAssets: {
    artwork: PendingFileInput | null;
    tracks: Array<PendingFileInput & { trackIndex: number }>;
  };
}

@Injectable()
export class CatalogService {
  constructor(private readonly database: DatabaseService) {}

  async listReleases(organizationId: string): Promise<Array<{
    id: string;
    title: string;
    artistName: string;
    type: CatalogReleaseType;
    releaseDate: string | null;
    coverUrl: null;
    status: CatalogReleaseStatus;
  }>> {
    const result = await this.database.query<ReleaseListRow>(
      `SELECT
         r.id,
         r.title,
         r.release_type,
         r.status,
         metadata.release_date::text AS release_date,
         NULLIF(
           STRING_AGG(ai.canonical_name, ', ' ORDER BY credits.display_order)
             FILTER (WHERE ai.id IS NOT NULL),
           ''
         ) AS artist_name
       FROM releases r
       LEFT JOIN release_metadata_versions metadata
         ON metadata.release_id = r.id
        AND metadata.release_version = r.current_version
       LEFT JOIN release_artist_credits credits ON credits.release_id = r.id
       LEFT JOIN artist_identities ai ON ai.id = credits.artist_identity_id
       WHERE r.organization_id = $1
       GROUP BY r.id, r.title, r.release_type, r.status, metadata.release_date, r.updated_at
       ORDER BY r.updated_at DESC
       LIMIT 100`,
      [organizationId],
    );

    return result.rows.map((release) => ({
      id: release.id,
      title: release.title,
      artistName: release.artist_name ?? "Artista não definido",
      type: release.release_type,
      releaseDate: release.release_date,
      coverUrl: null,
      status: release.status,
    }));
  }

  async getRelease(organizationId: string, releaseId: string) {
    const releases = await this.database.query<ReleaseListRow>(
      `SELECT
         r.id,
         r.title,
         r.release_type,
         r.status,
         metadata.release_date::text AS release_date,
         NULLIF(
           STRING_AGG(ai.canonical_name, ', ' ORDER BY credits.display_order)
             FILTER (WHERE ai.id IS NOT NULL),
           ''
         ) AS artist_name
       FROM releases r
       LEFT JOIN release_metadata_versions metadata
         ON metadata.release_id = r.id
        AND metadata.release_version = r.current_version
       LEFT JOIN release_artist_credits credits ON credits.release_id = r.id
       LEFT JOIN artist_identities ai ON ai.id = credits.artist_identity_id
       WHERE r.organization_id = $1 AND r.id = $2
       GROUP BY r.id, r.title, r.release_type, r.status, metadata.release_date
       LIMIT 1`,
      [organizationId, releaseId],
    );

    const release = releases.rows[0];
    if (!release) throw new NotFoundException({ code: "RELEASE_NOT_FOUND", message: "Release was not found" });

    return {
      id: release.id,
      title: release.title,
      artistName: release.artist_name ?? "Artista não definido",
      type: release.release_type,
      releaseDate: release.release_date,
      coverUrl: null,
      status: release.status,
    };
  }

  async createRelease(input: CreateReleaseInput) {
    const association = await this.database.query<AssociatedArtistRow>(
      `SELECT artist_identity_id
       FROM artist_associations
       WHERE organization_id = $1
         AND artist_identity_id = $2
         AND status = 'ACTIVE'
       LIMIT 1`,
      [input.organizationId, input.primaryArtistIdentityId],
    );

    if (!association.rows[0]) {
      throw new BadRequestException({
        code: "ARTIST_NOT_ASSOCIATED_WITH_ORGANIZATION",
        message: "The primary artist is not associated with the active organization",
      });
    }

    const splitMicros = input.provisionalSplits.reduce((sum, split) => sum + Math.round(split.percentage * 1_000_000), 0);
    if (splitMicros !== 100_000_000) {
      throw new BadRequestException({ code: "PROVISIONAL_SPLITS_INVALID", message: "Provisional splits must total exactly 100 percent" });
    }

    if (input.pendingAssets.tracks.some((asset) => asset.trackIndex < 0 || asset.trackIndex >= input.tracks.length)) {
      throw new BadRequestException({ code: "TRACK_ASSET_INDEX_INVALID", message: "A pending track asset references an invalid track index" });
    }

    const releaseId = randomUUID();
    const releaseVersionId = randomUUID();
    const metadataVersionId = randomUUID();
    const recordingIds = input.tracks.map(() => randomUUID());
    const trackIds = input.tracks.map(() => randomUUID());
    const artworkAssetId = input.pendingAssets.artwork ? randomUUID() : null;
    const trackAssetDescriptors = input.pendingAssets.tracks.map((asset) => ({ ...asset, assetId: randomUUID() }));
    const now = new Date();
    const title = input.title.trim();

    const snapshot = {
      releaseId,
      version: 1,
      title,
      type: input.type,
      explicit: input.explicit,
      primaryArtistIdentityId: input.primaryArtistIdentityId,
      metadata: { releaseDate: input.releaseDate, primaryGenre: input.primaryGenre },
      tracks: input.tracks.map((track, index) => ({
        trackId: trackIds[index],
        recordingId: recordingIds[index],
        sequence: index + 1,
        title: track.title,
        explicit: track.explicit,
      })),
      provisionalSplits: input.provisionalSplits,
      pendingAssets: {
        artworkAssetId,
        trackAssetIds: trackAssetDescriptors.map((asset) => ({ trackIndex: asset.trackIndex, assetId: asset.assetId })),
      },
    };

    await this.database.transaction(async (client) => {
      await client.query(
        `INSERT INTO releases
          (id, organization_id, title, release_type, status, current_version, version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'DRAFT', 1, 1, $5, $5)`,
        [releaseId, input.organizationId, title, input.type, now],
      );

      for (let index = 0; index < input.tracks.length; index += 1) {
        const track = input.tracks[index];
        const recordingId = recordingIds[index];
        const trackId = trackIds[index];
        if (!track || !recordingId || !trackId) throw new Error("RELEASE_TRACK_CREATION_INVARIANT_BROKEN");

        await client.query(
          `INSERT INTO recordings (id, organization_id, title, version, created_at, updated_at)
           VALUES ($1, $2, $3, 1, $4, $4)`,
          [recordingId, input.organizationId, track.title.trim(), now],
        );
        await client.query(
          `INSERT INTO tracks (id, release_id, recording_id, sequence, title, explicit, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
          [trackId, releaseId, recordingId, index + 1, track.title.trim(), track.explicit, now],
        );
      }

      await client.query(
        `INSERT INTO release_metadata_versions
          (id, release_id, release_version, language, primary_genre, release_date, copyright_line, phonographic_copyright_line, created_at)
         VALUES ($1, $2, 1, NULL, $3, $4, NULL, NULL, $5)`,
        [metadataVersionId, releaseId, input.primaryGenre.trim(), input.releaseDate, now],
      );

      await client.query(
        `INSERT INTO release_artist_credits (release_id, artist_identity_id, credit_role, display_order)
         VALUES ($1, $2, 'PRIMARY', 1)`,
        [releaseId, input.primaryArtistIdentityId],
      );

      if (input.pendingAssets.artwork && artworkAssetId) {
        await client.query(
          `INSERT INTO assets
            (id, organization_id, asset_type, status, storage_key, file_name, content_type, byte_size, checksum_sha256, created_at, updated_at)
           VALUES ($1, $2, 'ARTWORK', 'PENDING_UPLOAD', $3, $4, $5, $6, NULL, $7, $7)`,
          [artworkAssetId, input.organizationId, `pending/${input.organizationId}/${artworkAssetId}`, input.pendingAssets.artwork.fileName, input.pendingAssets.artwork.contentType, input.pendingAssets.artwork.byteSize, now],
        );
        await client.query(
          `INSERT INTO release_assets (release_id, release_version, asset_id, asset_role, created_at)
           VALUES ($1, 1, $2, 'ARTWORK', $3)`,
          [releaseId, artworkAssetId, now],
        );
      }

      for (const asset of trackAssetDescriptors) {
        const recordingId = recordingIds[asset.trackIndex];
        if (!recordingId) throw new Error("TRACK_ASSET_RECORDING_INVARIANT_BROKEN");
        await client.query(
          `INSERT INTO assets
            (id, organization_id, asset_type, status, storage_key, file_name, content_type, byte_size, checksum_sha256, created_at, updated_at)
           VALUES ($1, $2, 'AUDIO_MASTER', 'PENDING_UPLOAD', $3, $4, $5, $6, NULL, $7, $7)`,
          [asset.assetId, input.organizationId, `pending/${input.organizationId}/${asset.assetId}`, asset.fileName, asset.contentType, asset.byteSize, now],
        );
        await client.query(
          `INSERT INTO recording_assets (recording_id, recording_version, asset_id, asset_role, created_at)
           VALUES ($1, 1, $2, 'AUDIO_MASTER', $3)`,
          [recordingId, asset.assetId, now],
        );
      }

      await client.query(
        `INSERT INTO release_versions (id, release_id, version_number, snapshot, created_at)
         VALUES ($1, $2, 1, $3::jsonb, $4)`,
        [releaseVersionId, releaseId, JSON.stringify(snapshot), now],
      );
    });

    return { id: releaseId, releaseId, status: "DRAFT" as const, version: 1 };
  }
}
