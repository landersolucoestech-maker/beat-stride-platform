import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

interface RiskSummaryRow extends QueryResultRow {
  open_count: string;
  investigating_count: string;
  confirmed_count: string;
  suspicious_usage_count: string | null;
}

interface RiskAlertRow extends QueryResultRow {
  id: string;
  opened_at: Date;
  recording_title: string;
  artist_name: string | null;
  destination_code: string | null;
  reason_detail: string | null;
  category: string;
  suspicious_usage_count: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "UNDER_REVIEW" | "ACTION_REQUIRED" | "RESOLVED" | "DISMISSED";
}

function mapStatus(status: RiskAlertRow["status"]): "OPEN" | "INVESTIGATING" | "CONFIRMED" | "RESOLVED" | "DISMISSED" {
  if (status === "UNDER_REVIEW") return "INVESTIGATING";
  if (status === "ACTION_REQUIRED") return "CONFIRMED";
  return status;
}

@Injectable()
export class RiskService {
  constructor(private readonly database: DatabaseService) {}

  async getOverview(organizationId: string) {
    const [summary, alerts] = await Promise.all([
      this.database.query<RiskSummaryRow>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'OPEN')::text AS open_count,
           COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW')::text AS investigating_count,
           COUNT(*) FILTER (WHERE status = 'ACTION_REQUIRED')::text AS confirmed_count,
           SUM(suspicious_usage_count) FILTER (WHERE status IN ('OPEN','UNDER_REVIEW','ACTION_REQUIRED'))::text AS suspicious_usage_count
         FROM risk_cases
         WHERE organization_id = $1`,
        [organizationId],
      ),
      this.database.query<RiskAlertRow>(
        `SELECT
           risk.id,
           risk.opened_at,
           recording.title AS recording_title,
           primary_artist.canonical_name AS artist_name,
           risk.destination_code,
           risk.reason_detail,
           risk.category,
           risk.suspicious_usage_count::text AS suspicious_usage_count,
           risk.severity,
           risk.status
         FROM risk_cases risk
         JOIN recordings recording
           ON risk.resource_type = 'RECORDING'
          AND recording.id = risk.resource_id
         LEFT JOIN LATERAL (
           SELECT artist.canonical_name
           FROM tracks track
           JOIN release_artist_credits credit
             ON credit.release_id = track.release_id
            AND credit.credit_role = 'PRIMARY'
           JOIN artist_identities artist ON artist.id = credit.artist_identity_id
           WHERE track.recording_id = recording.id
           ORDER BY track.created_at DESC, credit.display_order ASC
           LIMIT 1
         ) primary_artist ON TRUE
         WHERE risk.organization_id = $1
         ORDER BY risk.opened_at DESC, risk.id DESC
         LIMIT 200`,
        [organizationId],
      ),
    ]);

    const totals = summary.rows[0] ?? {
      open_count: "0",
      investigating_count: "0",
      confirmed_count: "0",
      suspicious_usage_count: null,
    };

    return {
      available: true,
      openCount: Number(totals.open_count),
      investigatingCount: Number(totals.investigating_count),
      confirmedCount: Number(totals.confirmed_count),
      suspiciousUsageCount: totals.suspicious_usage_count,
      alerts: alerts.rows.map((row) => ({
        id: row.id,
        detectedAt: row.opened_at.toISOString(),
        recordingTitle: row.recording_title,
        artistName: row.artist_name ?? "",
        destinationLabel: row.destination_code ?? "",
        reason: row.reason_detail ?? row.category,
        suspiciousUsageCount: row.suspicious_usage_count,
        severity: row.severity,
        status: mapStatus(row.status),
      })),
    };
  }
}
