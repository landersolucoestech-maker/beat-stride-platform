import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

interface RightsProtectionRow extends QueryResultRow {
  artist_identity_id: string;
  artist_name: string;
  representation_status: string | null;
  representation_valid_from: Date | null;
  representation_valid_until: Date | null;
  authority_scopes: string[] | null;
  protection_status: string | null;
  protection_controller_organization_id: string | null;
  active_authorizations: string;
  active_rights_declarations: string;
}

@Injectable()
export class RightsProtectionService {
  constructor(private readonly database: DatabaseService) {}

  async listForOrganization(organizationId: string) {
    const result = await this.database.query<RightsProtectionRow>(
      `SELECT
         ai.id AS artist_identity_id,
         ai.canonical_name AS artist_name,
         representation.status AS representation_status,
         representation.valid_from AS representation_valid_from,
         representation.valid_until AS representation_valid_until,
         authority.scopes AS authority_scopes,
         protection.status AS protection_status,
         protection.controller_organization_id AS protection_controller_organization_id,
         COALESCE(authorizations.active_authorizations, 0)::text AS active_authorizations,
         COALESCE(rights.active_rights_declarations, 0)::text AS active_rights_declarations
       FROM artist_associations association
       JOIN artist_identities ai ON ai.id = association.artist_identity_id
       LEFT JOIN LATERAL (
         SELECT ar.status, ar.valid_from, ar.valid_until
         FROM artist_representations ar
         WHERE ar.artist_identity_id = ai.id
           AND ar.organization_id = $1
         ORDER BY
           CASE ar.status WHEN 'ACTIVE' THEN 0 WHEN 'DISPUTED' THEN 1 ELSE 2 END,
           ar.updated_at DESC
         LIMIT 1
       ) representation ON TRUE
       LEFT JOIN LATERAL (
         SELECT ARRAY_AGG(DISTINCT ag.scope ORDER BY ag.scope) AS scopes
         FROM authority_grants ag
         WHERE ag.artist_identity_id = ai.id
           AND ag.organization_id = $1
           AND ag.status = 'ACTIVE'
           AND ag.valid_from <= NOW()
           AND (ag.valid_until IS NULL OR ag.valid_until > NOW())
       ) authority ON TRUE
       LEFT JOIN artist_protections protection ON protection.artist_identity_id = ai.id
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS active_authorizations
         FROM artist_authorizations authorization
         WHERE authorization.artist_identity_id = ai.id
           AND authorization.grantee_organization_id = $1
           AND authorization.status = 'ACTIVE'
           AND (authorization.valid_from IS NULL OR authorization.valid_from <= NOW())
           AND (authorization.valid_until IS NULL OR authorization.valid_until > NOW())
       ) authorizations ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS active_rights_declarations
         FROM rights_declarations declaration
         WHERE declaration.organization_id = $1
           AND declaration.artist_identity_id = ai.id
           AND declaration.status = 'ACTIVE'
           AND declaration.valid_from <= NOW()
           AND (declaration.valid_until IS NULL OR declaration.valid_until > NOW())
       ) rights ON TRUE
       WHERE association.organization_id = $1
         AND association.status = 'ACTIVE'
       ORDER BY ai.canonical_name ASC`,
      [organizationId],
    );

    const items = result.rows.map((row) => ({
      artistIdentityId: row.artist_identity_id,
      artistName: row.artist_name,
      representation: row.representation_status
        ? {
            status: row.representation_status,
            validFrom: row.representation_valid_from?.toISOString() ?? null,
            validUntil: row.representation_valid_until?.toISOString() ?? null,
          }
        : null,
      authorityScopes: row.authority_scopes ?? [],
      protection: row.protection_status
        ? {
            status: row.protection_status,
            controllerOrganizationId: row.protection_controller_organization_id,
            controlledByActiveOrganization: row.protection_controller_organization_id === organizationId,
          }
        : null,
      activeAuthorizations: Number(row.active_authorizations),
      activeRightsDeclarations: Number(row.active_rights_declarations),
    }));

    return {
      items,
      summary: {
        artistCount: items.length,
        activeRepresentations: items.filter((item) => item.representation?.status === "ACTIVE").length,
        artistsWithAuthority: items.filter((item) => item.authorityScopes.length > 0).length,
        protectedArtists: items.filter((item) => item.protection?.status === "ACTIVE").length,
      },
    };
  }
}
