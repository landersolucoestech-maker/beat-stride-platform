import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

export type ArtistKind = "PERSON" | "DUO" | "GROUP" | "PROJECT";
export type RepresentationSummaryStatus = "NONE" | "PENDING" | "ACTIVE" | "DISPUTED" | "TERMINATED";

interface ArtistRow extends QueryResultRow {
  id: string;
  canonical_name: string;
  kind: ArtistKind;
  status: "ACTIVE" | "INACTIVE";
  representation_status: RepresentationSummaryStatus;
  authority_verified: boolean;
}

@Injectable()
export class ArtistIdentityService {
  constructor(private readonly database: DatabaseService) {}

  async listForOrganization(organizationId: string): Promise<Array<{
    id: string;
    displayName: string;
    kind: ArtistKind;
    status: ArtistRow["status"];
    representationStatus: RepresentationSummaryStatus;
    authorityVerified: boolean;
    imageUrl: null;
  }>> {
    const result = await this.database.query<ArtistRow>(
      `SELECT
         ai.id,
         ai.canonical_name,
         ai.kind,
         ai.status,
         COALESCE((
           SELECT CASE
             WHEN ar.status = 'ACTIVE' THEN 'ACTIVE'
             WHEN ar.status = 'DISPUTED' THEN 'DISPUTED'
             WHEN ar.status = 'TERMINATED' THEN 'TERMINATED'
             WHEN ar.status IN ('REQUESTED','EVIDENCE_PENDING','UNDER_REVIEW','TERMINATION_REQUESTED','TRANSITIONING') THEN 'PENDING'
             ELSE 'NONE'
           END
           FROM artist_representations ar
           WHERE ar.artist_identity_id = ai.id
             AND ar.organization_id = $1
           ORDER BY ar.updated_at DESC
           LIMIT 1
         ), 'NONE') AS representation_status,
         EXISTS (
           SELECT 1
           FROM authority_grants ag
           WHERE ag.artist_identity_id = ai.id
             AND ag.organization_id = $1
             AND ag.status = 'ACTIVE'
             AND ag.valid_from <= NOW()
             AND (ag.valid_until IS NULL OR ag.valid_until > NOW())
         ) AS authority_verified
       FROM artist_associations aa
       JOIN artist_identities ai ON ai.id = aa.artist_identity_id
       WHERE aa.organization_id = $1
         AND aa.status = 'ACTIVE'
       ORDER BY ai.canonical_name ASC`,
      [organizationId],
    );

    return result.rows.map((artist) => ({
      id: artist.id,
      displayName: artist.canonical_name,
      kind: artist.kind,
      status: artist.status,
      representationStatus: artist.representation_status,
      authorityVerified: artist.authority_verified,
      imageUrl: null,
    }));
  }

  async createForOrganization(input: { organizationId: string; canonicalName: string; kind: ArtistKind }) {
    const artistIdentityId = randomUUID();
    const associationId = randomUUID();
    const canonicalName = input.canonicalName.trim();
    const normalizedName = canonicalName.toLocaleLowerCase("en-US");
    const now = new Date();

    await this.database.transaction(async (client) => {
      await client.query(
        `INSERT INTO artist_identities
          (id, canonical_name, normalized_name, kind, status, version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'ACTIVE', 1, $5, $5)`,
        [artistIdentityId, canonicalName, normalizedName, input.kind, now],
      );

      await client.query(
        `INSERT INTO artist_associations
          (id, organization_id, artist_identity_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, 'ACTIVE', $4, $4)`,
        [associationId, input.organizationId, artistIdentityId, now],
      );
    });

    return {
      id: artistIdentityId,
      displayName: canonicalName,
      kind: input.kind,
      status: "ACTIVE" as const,
      representationStatus: "NONE" as const,
      authorityVerified: false,
      imageUrl: null,
    };
  }
}
