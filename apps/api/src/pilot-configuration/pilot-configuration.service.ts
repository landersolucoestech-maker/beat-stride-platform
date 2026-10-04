import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type PilotStatus = "DRAFT" | "ACTIVE" | "RETIRED";

interface PilotConfigurationRow extends QueryResultRow {
  id: string;
  status: PilotStatus;
  max_active_organizations: number;
  max_releases_per_organization: number;
  allowed_destinations: string[];
  allowed_territories: string[];
  payout_limit_amount: string | null;
  payout_limit_currency: string | null;
  manual_review_required: boolean;
  distribution_enabled: boolean;
  payouts_enabled: boolean;
  emergency_disable: boolean;
  created_by_user_id: string;
  activated_by_user_id: string | null;
  created_at: Date;
  activated_at: Date | null;
  retired_at: Date | null;
  version: string;
}

@Injectable()
export class PilotConfigurationService {
  constructor(private readonly database: DatabaseService) {}

  async list() {
    const result = await this.database.query<PilotConfigurationRow>(
      `SELECT * FROM pilot_configurations ORDER BY created_at DESC`,
      [],
    );
    return { items: result.rows.map((row) => this.toConfiguration(row)) };
  }

  async create(input: {
    maxActiveOrganizations: number;
    maxReleasesPerOrganization: number;
    allowedDestinations: string[];
    allowedTerritories: string[];
    payoutLimitAmount?: string;
    payoutLimitCurrency?: string;
    manualReviewRequired: boolean;
    distributionEnabled: boolean;
    payoutsEnabled: boolean;
    emergencyDisable: boolean;
    actorUserId: string;
    correlationId: string;
  }) {
    if ((input.payoutLimitAmount === undefined) !== (input.payoutLimitCurrency === undefined)) {
      throw new ConflictException({ code: "PILOT_PAYOUT_LIMIT_INVALID", message: "Payout amount and currency must be supplied together" });
    }

    const id = randomUUID();
    const result = await this.database.query<PilotConfigurationRow>(
      `INSERT INTO pilot_configurations
        (id, status, max_active_organizations, max_releases_per_organization, allowed_destinations,
         allowed_territories, payout_limit_amount, payout_limit_currency, manual_review_required,
         distribution_enabled, payouts_enabled, emergency_disable, created_by_user_id, activated_by_user_id,
         created_at, activated_at, retired_at, version)
       VALUES ($1,'DRAFT',$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,NULL,NOW(),NULL,NULL,1)
       RETURNING *`,
      [
        id,
        input.maxActiveOrganizations,
        input.maxReleasesPerOrganization,
        JSON.stringify(input.allowedDestinations),
        JSON.stringify(input.allowedTerritories),
        input.payoutLimitAmount ?? null,
        input.payoutLimitCurrency?.toUpperCase() ?? null,
        input.manualReviewRequired,
        input.distributionEnabled,
        input.payoutsEnabled,
        input.emergencyDisable,
        input.actorUserId,
      ],
    );
    await this.audit(input.actorUserId, input.correlationId, id, "pilot.configuration.created", {});
    return this.toConfiguration(result.rows[0]!);
  }

  async activate(input: { configurationId: string; expectedVersion: number; actorUserId: string; correlationId: string }) {
    return this.database.transaction(async (client) => {
      const current = await this.lock(client, input.configurationId);
      this.assertVersion(current, input.expectedVersion);
      if (current.status !== "DRAFT") {
        throw new ConflictException({ code: "PILOT_CONFIGURATION_ACTIVATION_NOT_ALLOWED", message: "Only a draft pilot configuration can be activated" });
      }
      if (current.emergency_disable) {
        throw new ConflictException({ code: "PILOT_CONFIGURATION_DISABLED", message: "A configuration with emergency disable enabled cannot be activated" });
      }

      await client.query(
        `UPDATE pilot_configurations
         SET status = 'RETIRED', retired_at = NOW(), version = version + 1
         WHERE status = 'ACTIVE'`,
        [],
      );
      const result = await client.query<PilotConfigurationRow>(
        `UPDATE pilot_configurations
         SET status = 'ACTIVE', activated_by_user_id = $1, activated_at = NOW(), version = version + 1
         WHERE id = $2
         RETURNING *`,
        [input.actorUserId, input.configurationId],
      );
      await this.auditWithClient(client, input.actorUserId, input.correlationId, input.configurationId, "pilot.configuration.activated", {});
      return this.toConfiguration(result.rows[0]!);
    });
  }

  async emergencyDisable(input: { configurationId: string; expectedVersion: number; actorUserId: string; correlationId: string }) {
    return this.database.transaction(async (client) => {
      const current = await this.lock(client, input.configurationId);
      this.assertVersion(current, input.expectedVersion);
      if (current.status !== "ACTIVE") {
        throw new ConflictException({ code: "PILOT_EMERGENCY_DISABLE_NOT_ALLOWED", message: "Only the active pilot configuration can be emergency-disabled" });
      }
      const result = await client.query<PilotConfigurationRow>(
        `UPDATE pilot_configurations
         SET emergency_disable = true,
             distribution_enabled = false,
             payouts_enabled = false,
             version = version + 1
         WHERE id = $1
         RETURNING *`,
        [input.configurationId],
      );
      await this.auditWithClient(client, input.actorUserId, input.correlationId, input.configurationId, "pilot.configuration.emergency_disabled", {});
      return this.toConfiguration(result.rows[0]!);
    });
  }

  private async lock(client: PoolClient, configurationId: string): Promise<PilotConfigurationRow> {
    const result = await client.query<PilotConfigurationRow>(`SELECT * FROM pilot_configurations WHERE id = $1 FOR UPDATE`, [configurationId]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException({ code: "PILOT_CONFIGURATION_NOT_FOUND", message: "Pilot configuration was not found" });
    return row;
  }

  private assertVersion(row: PilotConfigurationRow, expectedVersion: number): void {
    const currentVersion = Number(row.version);
    if (currentVersion !== expectedVersion) {
      throw new ConflictException({ code: "PILOT_CONFIGURATION_VERSION_CONFLICT", message: "Pilot configuration changed before the operation was applied", currentVersion });
    }
  }

  private async audit(actorUserId: string, correlationId: string, configurationId: string, action: string, metadata: Record<string, unknown>) {
    await this.database.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'PilotConfiguration',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), actorUserId, action, configurationId, correlationId, JSON.stringify(metadata)],
    );
  }

  private async auditWithClient(client: PoolClient, actorUserId: string, correlationId: string, configurationId: string, action: string, metadata: Record<string, unknown>) {
    await client.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'PilotConfiguration',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), actorUserId, action, configurationId, correlationId, JSON.stringify(metadata)],
    );
  }

  private toConfiguration(row: PilotConfigurationRow) {
    return {
      id: row.id,
      status: row.status,
      maxActiveOrganizations: row.max_active_organizations,
      maxReleasesPerOrganization: row.max_releases_per_organization,
      allowedDestinations: row.allowed_destinations,
      allowedTerritories: row.allowed_territories,
      payoutLimitAmount: row.payout_limit_amount,
      payoutLimitCurrency: row.payout_limit_currency,
      manualReviewRequired: row.manual_review_required,
      distributionEnabled: row.distribution_enabled,
      payoutsEnabled: row.payouts_enabled,
      emergencyDisable: row.emergency_disable,
      createdByUserId: row.created_by_user_id,
      activatedByUserId: row.activated_by_user_id,
      createdAt: row.created_at.toISOString(),
      activatedAt: row.activated_at?.toISOString() ?? null,
      retiredAt: row.retired_at?.toISOString() ?? null,
      version: Number(row.version),
    };
  }
}
