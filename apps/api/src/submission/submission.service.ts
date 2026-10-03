import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

interface ReleaseWorkflowRow extends QueryResultRow {
  id: string;
  organization_id: string;
  status: string;
  current_version: number;
  version: string;
  primary_artist_identity_id: string | null;
  language: string | null;
  primary_genre: string | null;
  release_date: string | null;
  copyright_line: string | null;
  phonographic_copyright_line: string | null;
  artwork_available: boolean;
  track_count: string;
  audio_master_count: string;
  active_distribution_rights: boolean;
  active_distribution_authority: boolean;
}

export interface ReleaseReadiness {
  releaseId: string;
  status: string;
  version: number;
  ready: boolean;
  blockers: Array<{
    code: string;
    message: string;
  }>;
}

@Injectable()
export class SubmissionService {
  constructor(private readonly database: DatabaseService) {}

  async getReadiness(organizationId: string, releaseId: string): Promise<ReleaseReadiness> {
    const release = await this.loadWorkflowState(this.database, organizationId, releaseId);
    return this.buildReadiness(release);
  }

  async submit(input: {
    organizationId: string;
    releaseId: string;
    actorId: string;
    expectedVersion: number;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const release = await this.loadWorkflowState(client, input.organizationId, input.releaseId, true);
      const readiness = this.buildReadiness(release);

      if (readiness.version !== input.expectedVersion) {
        throw new ConflictException({
          code: "RELEASE_VERSION_CONFLICT",
          message: "Release changed before submission",
          currentVersion: readiness.version,
        });
      }

      if (!readiness.ready) {
        throw new ConflictException({
          code: "RELEASE_NOT_READY_FOR_SUBMISSION",
          message: "Release is not ready for submission",
          blockers: readiness.blockers,
        });
      }

      const submissionId = randomUUID();
      const qcReviewId = randomUUID();
      const outboxEventId = randomUUID();
      const now = new Date();
      const nextVersion = input.expectedVersion + 1;

      await client.query(
        `UPDATE releases
         SET status = 'SUBMITTED', version = $1, updated_at = $2
         WHERE id = $3 AND organization_id = $4 AND version = $5`,
        [nextVersion, now, input.releaseId, input.organizationId, input.expectedVersion],
      );

      await client.query(
        `INSERT INTO submissions
          (id, organization_id, release_id, release_version, status, submitted_by_actor_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $6)`,
        [submissionId, input.organizationId, input.releaseId, release.current_version, input.actorId, now],
      );

      await client.query(
        `INSERT INTO qc_reviews
          (id, submission_id, status, findings, started_at, completed_at, created_at, updated_at)
         VALUES ($1, $2, 'PENDING', '[]'::jsonb, NULL, NULL, $3, $3)`,
        [qcReviewId, submissionId, now],
      );

      await client.query(
        `INSERT INTO outbox_events
          (id, event_type, event_version, aggregate_type, aggregate_id, correlation_id, causation_id, actor, payload, status, attempts, occurred_at, available_at, processed_at, last_error)
         VALUES ($1, 'release.submitted', 1, 'Release', $2, $3, NULL, $4::jsonb, $5::jsonb, 'PENDING', 0, $6, $6, NULL, NULL)`,
        [
          outboxEventId,
          input.releaseId,
          input.correlationId,
          JSON.stringify({ type: "USER", id: input.actorId, organizationId: input.organizationId }),
          JSON.stringify({ releaseId: input.releaseId, submissionId, releaseVersion: release.current_version }),
          now,
        ],
      );

      return {
        releaseId: input.releaseId,
        submissionId,
        qcReviewId,
        status: "SUBMITTED" as const,
        version: nextVersion,
      };
    });
  }

  private async loadWorkflowState(
    queryable: Pick<DatabaseService, "query"> | PoolClient,
    organizationId: string,
    releaseId: string,
    lock = false,
  ): Promise<ReleaseWorkflowRow> {
    const lockClause = lock ? "FOR UPDATE OF r" : "";
    const result = await queryable.query<ReleaseWorkflowRow>(
      `SELECT
         r.id,
         r.organization_id,
         r.status,
         r.current_version,
         r.version::text AS version,
         primary_credit.artist_identity_id AS primary_artist_identity_id,
         metadata.language,
         metadata.primary_genre,
         metadata.release_date::text AS release_date,
         metadata.copyright_line,
         metadata.phonographic_copyright_line,
         EXISTS (
           SELECT 1
           FROM release_assets ra
           JOIN assets a ON a.id = ra.asset_id
           WHERE ra.release_id = r.id
             AND ra.release_version = r.current_version
             AND ra.asset_role = 'ARTWORK'
             AND a.status = 'AVAILABLE'
         ) AS artwork_available,
         (SELECT COUNT(*) FROM tracks t WHERE t.release_id = r.id)::text AS track_count,
         (
           SELECT COUNT(*)
           FROM tracks t
           JOIN recording_assets recording_asset
             ON recording_asset.recording_id = t.recording_id
            AND recording_asset.recording_version = 1
            AND recording_asset.asset_role = 'AUDIO_MASTER'
           JOIN assets audio_asset
             ON audio_asset.id = recording_asset.asset_id
            AND audio_asset.status = 'AVAILABLE'
           WHERE t.release_id = r.id
         )::text AS audio_master_count,
         EXISTS (
           SELECT 1
           FROM rights_declarations declaration
           WHERE declaration.organization_id = r.organization_id
             AND declaration.resource_type = 'RELEASE'
             AND declaration.resource_id = r.id
             AND declaration.scope = 'MASTER_DISTRIBUTION'
             AND declaration.status = 'ACTIVE'
             AND declaration.valid_from <= NOW()
             AND (declaration.valid_until IS NULL OR declaration.valid_until > NOW())
         ) AS active_distribution_rights,
         EXISTS (
           SELECT 1
           FROM authority_grants grant_record
           WHERE grant_record.organization_id = r.organization_id
             AND grant_record.artist_identity_id = primary_credit.artist_identity_id
             AND grant_record.scope = 'DISTRIBUTION_SUBMIT'
             AND grant_record.status = 'ACTIVE'
             AND grant_record.valid_from <= NOW()
             AND (grant_record.valid_until IS NULL OR grant_record.valid_until > NOW())
             AND (
               (grant_record.resource_type = 'RELEASE' AND grant_record.resource_id = r.id::text)
               OR grant_record.resource_type IN ('ARTIST','CATALOG')
             )
         ) AS active_distribution_authority
       FROM releases r
       LEFT JOIN release_metadata_versions metadata
         ON metadata.release_id = r.id
        AND metadata.release_version = r.current_version
       LEFT JOIN LATERAL (
         SELECT credit.artist_identity_id
         FROM release_artist_credits credit
         WHERE credit.release_id = r.id AND credit.credit_role = 'PRIMARY'
         ORDER BY credit.display_order ASC
         LIMIT 1
       ) primary_credit ON TRUE
       WHERE r.id = $1 AND r.organization_id = $2
       ${lockClause}`,
      [releaseId, organizationId],
    );

    const release = result.rows[0];
    if (!release) throw new NotFoundException({ code: "RELEASE_NOT_FOUND", message: "Release was not found" });
    return release;
  }

  private buildReadiness(release: ReleaseWorkflowRow): ReleaseReadiness {
    const blockers: ReleaseReadiness["blockers"] = [];
    const trackCount = Number(release.track_count);
    const audioMasterCount = Number(release.audio_master_count);

    if (!["DRAFT", "CORRECTION_REQUIRED"].includes(release.status)) {
      blockers.push({ code: "RELEASE_STATE_NOT_SUBMITTABLE", message: "Release state does not allow submission" });
    }
    if (!release.primary_artist_identity_id) blockers.push({ code: "PRIMARY_ARTIST_REQUIRED", message: "Primary artist is required" });
    if (!release.release_date) blockers.push({ code: "RELEASE_DATE_REQUIRED", message: "Release date is required" });
    if (!release.primary_genre) blockers.push({ code: "PRIMARY_GENRE_REQUIRED", message: "Primary genre is required" });
    if (!release.language) blockers.push({ code: "LANGUAGE_REQUIRED", message: "Release language is required before submission" });
    if (!release.copyright_line) blockers.push({ code: "COPYRIGHT_LINE_REQUIRED", message: "Copyright line is required before submission" });
    if (!release.phonographic_copyright_line) blockers.push({ code: "PHONOGRAPHIC_COPYRIGHT_LINE_REQUIRED", message: "Phonographic copyright line is required before submission" });
    if (trackCount < 1) blockers.push({ code: "TRACK_REQUIRED", message: "At least one track is required" });
    if (!release.artwork_available) blockers.push({ code: "ARTWORK_UPLOAD_REQUIRED", message: "Artwork must finish uploading and pass asset intake" });
    if (audioMasterCount !== trackCount) blockers.push({ code: "AUDIO_MASTER_UPLOAD_REQUIRED", message: "Every track needs an available audio master" });
    if (!release.active_distribution_rights) blockers.push({ code: "DISTRIBUTION_RIGHTS_REQUIRED", message: "An active master distribution rights declaration is required" });
    if (!release.active_distribution_authority) blockers.push({ code: "DISTRIBUTION_AUTHORITY_REQUIRED", message: "Verified distribution submission authority is required" });

    return {
      releaseId: release.id,
      status: release.status,
      version: Number(release.version),
      ready: blockers.length === 0,
      blockers,
    };
  }
}
