import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../platform/database/database.service.js";

export interface CatalogReleaseListItem {
  id: string;
  title: string;
  artistName: string;
  type: "SINGLE" | "EP" | "ALBUM";
  releaseDate: string | null;
  coverUrl: string | null;
  status: string;
}

interface CatalogReleaseRow {
  id: string;
  title: string;
  release_type: "SINGLE" | "EP" | "ALBUM";
  status: string;
  release_date: string | null;
  artist_name: string | null;
}

@Injectable()
export class CatalogReadService {
  constructor(private readonly database: DatabaseService) {}

  async listReleases(organizationId: string): Promise<CatalogReleaseListItem[]> {
    const result = await this.database.query<CatalogReleaseRow>(
      `
        SELECT
          r.id,
          r.title,
          r.release_type,
          r.status,
          rm.release_date::text AS release_date,
          NULLIF(string_agg(ai.canonical_name, ', ' ORDER BY rac.display_order) FILTER (WHERE ai.id IS NOT NULL), '') AS artist_name
        FROM releases r
        LEFT JOIN release_metadata_versions rm
          ON rm.release_id = r.id
         AND rm.release_version = r.current_version
        LEFT JOIN release_artist_credits rac
          ON rac.release_id = r.id
         AND rac.credit_role = 'PRIMARY'
        LEFT JOIN artist_identities ai
          ON ai.id = rac.artist_identity_id
        WHERE r.organization_id = $1
        GROUP BY r.id, r.title, r.release_type, r.status, rm.release_date, r.updated_at
        ORDER BY r.updated_at DESC, r.id DESC
        LIMIT 100
      `,
      [organizationId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      artistName: row.artist_name ?? "",
      type: row.release_type,
      releaseDate: row.release_date,
      coverUrl: null,
      status: row.status,
    }));
  }
}
