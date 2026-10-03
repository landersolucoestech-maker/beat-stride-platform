import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";
import { z } from "zod";

import type { ClaimedOutboxEvent } from "./outbox.service.js";
import { WorkerDatabaseService } from "./worker-database.service.js";

const releaseSubmittedPayloadSchema = z.object({
  releaseId: z.string().uuid(),
  submissionId: z.string().uuid(),
  releaseVersion: z.number().int().positive(),
});

interface QcStateRow extends QueryResultRow {
  qc_review_id: string;
  qc_status: string;
  release_status: string;
}

interface IntegrityRow extends QueryResultRow {
  language: string | null;
  primary_genre: string | null;
  release_date: string | null;
  copyright_line: string | null;
  phonographic_copyright_line: string | null;
  track_count: string;
  audio_master_count: string;
  artwork_available: boolean;
}

@Injectable()
export class ReleaseSubmittedHandler {
  constructor(private readonly database: WorkerDatabaseService) {}

  supports(event: ClaimedOutboxEvent): boolean {
    return event.eventType === "release.submitted" && event.eventVersion === 1;
  }

  async handle(event: ClaimedOutboxEvent): Promise<void> {
    const payload = releaseSubmittedPayloadSchema.parse(event.payload);

    await this.database.transaction(async (client) => {
      const stateResult = await client.query<QcStateRow>(
        `SELECT q.id AS qc_review_id, q.status AS qc_status, r.status AS release_status
         FROM submissions s
         JOIN qc_reviews q ON q.submission_id = s.id
         JOIN releases r ON r.id = s.release_id
         WHERE s.id = $1 AND s.release_id = $2
         ORDER BY q.created_at DESC
         LIMIT 1
         FOR UPDATE OF s, q, r`,
        [payload.submissionId, payload.releaseId],
      );

      const state = stateResult.rows[0];
      if (!state) throw new Error("QC_SUBMISSION_STATE_NOT_FOUND");
      if (["PASS", "WARNING", "BLOCKING_ERROR", "MANUAL_REVIEW", "CORRECTION_REQUIRED", "REJECTED", "APPROVED"].includes(state.qc_status)) {
        return;
      }

      const now = new Date();
      await client.query(`UPDATE submissions SET status = 'VALIDATING', updated_at = $1 WHERE id = $2`, [now, payload.submissionId]);
      await client.query(`UPDATE qc_reviews SET status = 'RUNNING', started_at = COALESCE(started_at, $1), updated_at = $1 WHERE id = $2`, [now, state.qc_review_id]);
      await client.query(`UPDATE releases SET status = 'VALIDATING', updated_at = $1 WHERE id = $2`, [now, payload.releaseId]);

      const integrityResult = await client.query<IntegrityRow>(
        `SELECT
           metadata.language,
           metadata.primary_genre,
           metadata.release_date::text AS release_date,
           metadata.copyright_line,
           metadata.phonographic_copyright_line,
           (SELECT COUNT(*) FROM tracks t WHERE t.release_id = r.id)::text AS track_count,
           (
             SELECT COUNT(*)
             FROM tracks t
             JOIN recording_assets ra ON ra.recording_id = t.recording_id AND ra.recording_version = 1 AND ra.asset_role = 'AUDIO_MASTER'
             JOIN assets a ON a.id = ra.asset_id AND a.status = 'AVAILABLE'
             WHERE t.release_id = r.id
           )::text AS audio_master_count,
           EXISTS (
             SELECT 1
             FROM release_assets ra
             JOIN assets a ON a.id = ra.asset_id
             WHERE ra.release_id = r.id
               AND ra.release_version = r.current_version
               AND ra.asset_role = 'ARTWORK'
               AND a.status = 'AVAILABLE'
           ) AS artwork_available
         FROM releases r
         LEFT JOIN release_metadata_versions metadata
           ON metadata.release_id = r.id AND metadata.release_version = r.current_version
         WHERE r.id = $1`,
        [payload.releaseId],
      );

      const integrity = integrityResult.rows[0];
      if (!integrity) throw new Error("QC_RELEASE_NOT_FOUND");

      const findings: Array<{ code: string; severity: "BLOCKING" | "MANUAL"; message: string }> = [];
      if (!integrity.language) findings.push({ code: "LANGUAGE_REQUIRED", severity: "BLOCKING", message: "Release language is missing" });
      if (!integrity.primary_genre) findings.push({ code: "PRIMARY_GENRE_REQUIRED", severity: "BLOCKING", message: "Primary genre is missing" });
      if (!integrity.release_date) findings.push({ code: "RELEASE_DATE_REQUIRED", severity: "BLOCKING", message: "Release date is missing" });
      if (!integrity.copyright_line) findings.push({ code: "COPYRIGHT_LINE_REQUIRED", severity: "BLOCKING", message: "Copyright line is missing" });
      if (!integrity.phonographic_copyright_line) findings.push({ code: "PHONOGRAPHIC_COPYRIGHT_LINE_REQUIRED", severity: "BLOCKING", message: "Phonographic copyright line is missing" });

      const trackCount = Number(integrity.track_count);
      const audioMasterCount = Number(integrity.audio_master_count);
      if (trackCount < 1) findings.push({ code: "TRACK_REQUIRED", severity: "BLOCKING", message: "Release has no tracks" });
      if (!integrity.artwork_available) findings.push({ code: "ARTWORK_UNAVAILABLE", severity: "BLOCKING", message: "Artwork is not available" });
      if (audioMasterCount !== trackCount) findings.push({ code: "AUDIO_MASTER_UNAVAILABLE", severity: "BLOCKING", message: "One or more audio masters are not available" });

      if (findings.some((finding) => finding.severity === "BLOCKING")) {
        await client.query(
          `UPDATE qc_reviews
           SET status = 'CORRECTION_REQUIRED', findings = $1::jsonb, completed_at = $2, updated_at = $2
           WHERE id = $3`,
          [JSON.stringify(findings), now, state.qc_review_id],
        );
        await client.query(`UPDATE submissions SET status = 'CORRECTION_REQUIRED', updated_at = $1 WHERE id = $2`, [now, payload.submissionId]);
        await client.query(`UPDATE releases SET status = 'CORRECTION_REQUIRED', updated_at = $1 WHERE id = $2`, [now, payload.releaseId]);
        return;
      }

      findings.push({
        code: "MANUAL_REVIEW_REQUIRED",
        severity: "MANUAL",
        message: "Automated integrity checks passed; editorial, rights and provider-specific QC still require review",
      });

      await client.query(
        `UPDATE qc_reviews
         SET status = 'MANUAL_REVIEW', findings = $1::jsonb, completed_at = $2, updated_at = $2
         WHERE id = $3`,
        [JSON.stringify(findings), now, state.qc_review_id],
      );
      await client.query(`UPDATE releases SET status = 'MANUAL_REVIEW', updated_at = $1 WHERE id = $2`, [now, payload.releaseId]);
    });
  }
}
