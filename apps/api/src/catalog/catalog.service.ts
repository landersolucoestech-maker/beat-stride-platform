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

export interface CreateReleaseInput {
  organizationId: string;
  title: string;
  type: CatalogReleaseType;
  primaryArtistIdentityId: string;
  releaseDate: string;
  language: string;
  primaryGenre: string;
  copyrightLine: string;
  phonographicCopyrightLine: string;
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
    if (!release) {
      throw new NotFoundException({ code: "RELEASE_NOT_FOUND", message: "Release was not found" });
    }

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

    const releaseId = randomUUID();
    const releaseVersionId = randomUUID();
    const metadataVersionId = randomUUID();
    const now = new Date();
    const title = input.title.trim();
    const snapshot = {
      releaseId,
      version: 1,
      title,
      type: input.type,
      primaryArtistIdentityId: input.primaryArtistIdentityId,
      metadata: {
        releaseDate: input.releaseDate,
        language: input.language,
        primaryGenre: input.primaryGenre,
        copyrightLine: input.copyrightLine,
        phonographicCopyrightLine: input.phonographicCopyrightLine,
      },
    };

    await this.database.transaction(async (client) => {
      await client.query(
        `INSERT INTO releases
          (id, organization_id, title, release_type, status, current_version, version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'DRAFT', 1, 1, $5, $5)`,
        [releaseId, input.organizationId, title, input.type, now],
      );

      await client.query(
        `INSERT INTO release_versions (id, release_id, version_number, snapshot, created_at)
         VALUES ($1, $2, 1, $3::jsonb, $4)`,
        [releaseVersionId, releaseId, JSON.stringify(snapshot), now],
      );

      await client.query(
        `INSERT INTO release_metadata_versions
          (id, release_id, release_version, language, primary_genre, release_date, copyright_line, phonographic_copyright_line, created_at)
         VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8)`,
        [
          metadataVersionId,
          releaseId,
          input.language.trim(),
          input.primaryGenre.trim(),
          input.releaseDate,
          input.copyrightLine.trim(),
          input.phonographicCopyrightLine.trim(),
          now,
        ],
      );

      await client.query(
        `INSERT INTO release_artist_credits
          (release_id, artist_identity_id, credit_role, display_order)
         VALUES ($1, $2, 'PRIMARY', 1)`,
        [releaseId, input.primaryArtistIdentityId],
      );
    });

    return {
      id: releaseId,
      title,
      artistIdentityId: input.primaryArtistIdentityId,
      type: input.type,
      releaseDate: input.releaseDate,
      status: "DRAFT" as const,
      version: 1,
    };
  }
}
