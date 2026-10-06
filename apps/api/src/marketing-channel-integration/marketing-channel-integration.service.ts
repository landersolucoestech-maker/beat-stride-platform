import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type ProviderCode = "META" | "TIKTOK" | "YOUTUBE";

interface ConnectionRow extends QueryResultRow {
  provider_code: ProviderCode;
  status: "PENDING" | "ACTIVE" | "REAUTH_REQUIRED" | "REVOKED" | "ERROR";
  external_account_id: string | null;
  external_account_name: string | null;
  granted_scopes: unknown;
  connected_at: Date | null;
  revoked_at: Date | null;
  last_error_code: string | null;
}

const providers: Array<{
  code: ProviderCode;
  label: string;
  channels: string[];
  description: string;
}> = [
  {
    code: "META",
    label: "Meta",
    channels: ["INSTAGRAM", "FACEBOOK"],
    description: "Instagram e Facebook para publicação e campanhas vinculadas ao release.",
  },
  {
    code: "TIKTOK",
    label: "TikTok",
    channels: ["TIKTOK"],
    description: "TikTok para conteúdo promocional e vídeos curtos do release.",
  },
  {
    code: "YOUTUBE",
    label: "YouTube",
    channels: ["YOUTUBE", "YOUTUBE_SHORTS"],
    description: "YouTube e YouTube Shorts para conteúdo audiovisual do release.",
  },
];

@Injectable()
export class MarketingChannelIntegrationService {
  constructor(private readonly database: DatabaseService) {}

  async getOverview(organizationId: string) {
    const result = await this.database.query<ConnectionRow>(
      `SELECT
         provider_code,
         status,
         external_account_id,
         external_account_name,
         granted_scopes,
         connected_at,
         revoked_at,
         last_error_code
       FROM marketing_channel_connections
       WHERE organization_id = $1`,
      [organizationId],
    );

    const byProvider = new Map(result.rows.map((row) => [row.provider_code, row]));

    return {
      providers: providers.map((provider) => {
        const row = byProvider.get(provider.code);
        const status = !row
          ? "NOT_CONNECTED"
          : row.status === "ACTIVE"
            ? "CONNECTED"
            : row.status === "PENDING"
              ? "AUTHORIZATION_PENDING"
              : row.status === "REAUTH_REQUIRED" || row.status === "ERROR"
                ? "REAUTH_REQUIRED"
                : "REVOKED";

        return {
          code: provider.code,
          label: provider.label,
          description: provider.description,
          channels: provider.channels,
          available: false,
          status,
          externalAccountId: row?.external_account_id ?? null,
          externalAccountName: row?.external_account_name ?? null,
          grantedScopes: Array.isArray(row?.granted_scopes) ? row.granted_scopes : [],
          connectedAt: row?.connected_at?.toISOString() ?? null,
          revokedAt: row?.revoked_at?.toISOString() ?? null,
          lastErrorCode: row?.last_error_code ?? null,
          connectUrl: null,
          manageUrl: null,
          unavailableReason: "MARKETING_CHANNEL_PROVIDER_NOT_CONFIGURED",
        };
      }),
    };
  }

  async beginAuthorization(provider: ProviderCode): Promise<never> {
    throw new ServiceUnavailableException({
      code: "MARKETING_CHANNEL_PROVIDER_NOT_CONFIGURED",
      message: `${provider} authorization adapter is not configured`,
    });
  }

  async disconnect(provider: ProviderCode): Promise<never> {
    throw new ServiceUnavailableException({
      code: "MARKETING_CHANNEL_PROVIDER_NOT_CONFIGURED",
      message: `${provider} revocation adapter is not configured`,
    });
  }
}
