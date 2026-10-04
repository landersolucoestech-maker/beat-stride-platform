import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

interface EnrollmentRow extends QueryResultRow {
  id: string;
  recording_id: string;
  recording_title: string;
  artist_name: string | null;
  status: string;
  provider_code: string | null;
}

interface AllowlistRow extends QueryResultRow {
  id: string;
  recording_id: string;
  recording_title: string;
  platform_code: string;
  channel_reference: string;
  status: string;
}

@Injectable()
export class ContentIdService {
  constructor(private readonly database: DatabaseService) {}

  async getOverview(organizationId: string) {
    const [enrollments, allowlist] = await Promise.all([
      this.database.query<EnrollmentRow>(
        `SELECT
           enrollment.id,
           enrollment.recording_id,
           recording.title AS recording_title,
           primary_artist.canonical_name AS artist_name,
           enrollment.status,
           enrollment.provider_code
         FROM content_id_enrollments enrollment
         JOIN recordings recording ON recording.id = enrollment.recording_id
         LEFT JOIN LATERAL (
           SELECT artist.canonical_name
           FROM tracks track
           JOIN release_artist_credits credit
             ON credit.release_id = track.release_id
            AND credit.credit_role = 'PRIMARY'
           JOIN artist_identities artist ON artist.id = credit.artist_identity_id
           WHERE track.recording_id = enrollment.recording_id
           ORDER BY track.created_at DESC, credit.display_order ASC
           LIMIT 1
         ) primary_artist ON TRUE
         WHERE enrollment.organization_id = $1
         ORDER BY enrollment.updated_at DESC, enrollment.id DESC`,
        [organizationId],
      ),
      this.database.query<AllowlistRow>(
        `SELECT
           entry.id,
           entry.recording_id,
           recording.title AS recording_title,
           entry.platform_code,
           entry.channel_reference,
           entry.status
         FROM ugc_allowlist_entries entry
         JOIN recordings recording ON recording.id = entry.recording_id
         WHERE entry.organization_id = $1
         ORDER BY entry.created_at DESC, entry.id DESC`,
        [organizationId],
      ),
    ]);

    return {
      enrollments: enrollments.rows.map((row) => ({
        id: row.id,
        recordingId: row.recording_id,
        recordingTitle: row.recording_title,
        artistName: row.artist_name ?? "Artista não identificado",
        status: row.status,
        providerCode: row.provider_code,
      })),
      allowlist: allowlist.rows.map((row) => ({
        id: row.id,
        recordingId: row.recording_id,
        recordingTitle: row.recording_title,
        platformCode: row.platform_code,
        channelReference: row.channel_reference,
        status: row.status,
      })),
    };
  }
}
