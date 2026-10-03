import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../platform/database/database.service.js";

export type RepresentationSummaryStatus = "NONE" | "PENDING" | "ACTIVE" | "DISPUTED" | "TERMINATED";

export interface ArtistIdentityListItem {
  id: string;
  displayName: string;
  status: "ACTIVE" | "INACTIVE";
  representationStatus: RepresentationSummaryStatus;
  authorityVerified: boolean;
  imageUrl: string | null;
}

interface ArtistIdentityRow {
  id: string;
  canonical_name: string;
  status: "ACTIVE" | "INACTIVE";
  representation_status: string | null;
  authority_verified: boolean;
}

function summarizeRepresentation(status: string | null): RepresentationSummaryStatus {
  if (status === null) return "NONE";
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "DISPUTED") return "DISPUTED";
  if (status === "TERMINATED") return "TERMINATED";
  return "PENDING";
}

@Injectable()
export class ArtistReadService {
  constructor(private readonly database: DatabaseService) {}

  async listForOrganization(organizationId: string): Promise<ArtistIdentityListItem[]> {
    const result = await this.database.query<ArtistIdentityRow>(
      `
        SELECT
          ai.id,
          ai.canonical_name,
          ai.status,
          representation.status AS representation_status,
          EXISTS (
            SELECT 1
            FROM authority_grants ag
            WHERE ag.artist_identity_id = ai.id
              AND ag.organization_id = $1
              AND ag.status = 'ACTIVE'
              AND ag.valid_from <= CURRENT_TIMESTAMP
              AND (ag.valid_until IS NULL OR ag.valid_until > CURRENT_TIMESTAMP)
          ) AS authority_verified
        FROM artist_associations association
        INNER JOIN artist_identities ai
          ON ai.id = association.artist_identity_id
        LEFT JOIN LATERAL (
          SELECT ar.status
          FROM artist_representations ar
          WHERE ar.artist_identity_id = ai.id
            AND ar.organization_id = $1
          ORDER BY ar.updated_at DESC, ar.id DESC
          LIMIT 1
        ) representation ON TRUE
        WHERE association.organization_id = $1
          AND association.status = 'ACTIVE'
        ORDER BY ai.canonical_name ASC, ai.id ASC
        LIMIT 250
      `,
      [organizationId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      displayName: row.canonical_name,
      status: row.status,
      representationStatus: summarizeRepresentation(row.representation_status),
      authorityVerified: row.authority_verified,
      imageUrl: null,
    }));
  }
}
