import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

interface ConnectionRow extends QueryResultRow {
  external_organization_id: string;
  status: "PENDING" | "ACTIVE" | "REVOKED" | "ERROR";
  connected_at: Date | null;
}

interface CampaignProjectionRow extends QueryResultRow {
  external_campaign_id: string;
  release_id: string;
  release_title: string;
  status: string;
  updated_at: Date;
}

@Injectable()
export class CreatorsIntegrationService {
  constructor(private readonly database: DatabaseService) {}

  async getOverview(organizationId: string) {
    const [connectionResult, campaignsResult] = await Promise.all([
      this.database.query<ConnectionRow>(
        `SELECT external_organization_id, status, connected_at
         FROM creators_connections
         WHERE organization_id = $1
         LIMIT 1`,
        [organizationId],
      ),
      this.database.query<CampaignProjectionRow>(
        `SELECT
           projection.external_campaign_id,
           projection.release_id,
           release.title AS release_title,
           projection.status,
           projection.updated_at
         FROM creators_campaign_projections projection
         JOIN releases release ON release.id = projection.release_id
         WHERE projection.organization_id = $1
         ORDER BY projection.updated_at DESC, projection.external_campaign_id DESC`,
        [organizationId],
      ),
    ]);

    const connection = connectionResult.rows[0];
    const status = !connection
      ? "NOT_CONNECTED"
      : connection.status === "ACTIVE"
        ? "CONNECTED"
        : connection.status === "REVOKED"
          ? "REVOKED"
          : "REAUTH_REQUIRED";

    return {
      connection: {
        available: true,
        status,
        connectedOrganizationName: null,
        mappedOrganizationId: connection?.external_organization_id ?? null,
        connectUrl: null,
        manageUrl: null,
        connectedAt: connection?.connected_at?.toISOString() ?? null,
      },
      campaigns: campaignsResult.rows.map((row) => ({
        externalCampaignId: row.external_campaign_id,
        releaseId: row.release_id,
        releaseTitle: row.release_title,
        statusLabel: row.status,
        openUrl: null,
        updatedAt: row.updated_at.toISOString(),
      })),
    };
  }
}
