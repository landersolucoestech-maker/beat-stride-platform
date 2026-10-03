import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

export type ArtistKind = "PERSON" | "DUO" | "GROUP" | "PROJECT";

interface ArtistRow extends QueryResultRow {
  id: string;
  canonical_name: string;
  kind: ArtistKind;
  status: "ACTIVE" | "INACTIVE";
}

@Injectable()
export class ArtistIdentityService {
  constructor(private readonly database: DatabaseService) {}

  async listForOrganization(organizationId: string): Promise<Array<{ id: string; name: string; kind: ArtistKind; status: ArtistRow["status"] }>> {
    const result = await this.database.query<ArtistRow>(
      `SELECT ai.id, ai.canonical_name, ai.kind, ai.status
       FROM artist_associations aa
       JOIN artist_identities ai ON ai.id = aa.artist_identity_id
       WHERE aa.organization_id = $1
         AND aa.status = 'ACTIVE'
       ORDER BY ai.canonical_name ASC`,
      [organizationId],
    );

    return result.rows.map((artist) => ({ id: artist.id, name: artist.canonical_name, kind: artist.kind, status: artist.status }));
  }

  async createForOrganization(input: { organizationId: string; canonicalName: string; kind: ArtistKind }): Promise<{ id: string; name: string; kind: ArtistKind; status: "ACTIVE" }> {
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

    return { id: artistIdentityId, name: canonicalName, kind: input.kind, status: "ACTIVE" };
  }
}
