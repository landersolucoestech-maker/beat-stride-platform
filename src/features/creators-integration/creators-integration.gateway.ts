import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { CreatorsIntegrationOverview } from "./creators-integration.types";

export interface CreatorsIntegrationGateway {
  getOverview(): Promise<CreatorsIntegrationOverview>;
  disconnect(): Promise<void>;
}

class HttpCreatorsIntegrationGateway implements CreatorsIntegrationGateway {
  async getOverview(): Promise<CreatorsIntegrationOverview> {
    if (!isApiConfigured()) {
      return {
        connection: {
          available: false,
          status: "NOT_CONNECTED",
          connectedOrganizationName: null,
          mappedOrganizationId: null,
          connectUrl: null,
          manageUrl: null,
          connectedAt: null,
        },
        campaigns: [],
      };
    }

    const response = await apiRequest("/api/v1/integrations/creators");
    return (await response.json()) as CreatorsIntegrationOverview;
  }

  async disconnect(): Promise<void> {
    if (!isApiConfigured()) throw new Error("CREATORS_INTEGRATION_API_NOT_CONNECTED");
    await apiRequest("/api/v1/integrations/creators", { method: "DELETE" });
  }
}

export const creatorsIntegrationGateway: CreatorsIntegrationGateway = new HttpCreatorsIntegrationGateway();
