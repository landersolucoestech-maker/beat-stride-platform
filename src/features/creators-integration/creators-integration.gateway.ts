import type { CreatorsIntegrationOverview } from "./creators-integration.types";

export interface CreatorsIntegrationGateway {
  getOverview(): Promise<CreatorsIntegrationOverview>;
  disconnect(): Promise<void>;
}

class HttpCreatorsIntegrationGateway implements CreatorsIntegrationGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getOverview(): Promise<CreatorsIntegrationOverview> {
    if (!this.baseUrl) {
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

    const response = await fetch(this.url("/api/v1/integrations/creators"), {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`CREATORS_INTEGRATION_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as CreatorsIntegrationOverview;
  }

  async disconnect(): Promise<void> {
    if (!this.baseUrl) throw new Error("CREATORS_INTEGRATION_API_NOT_CONNECTED");
    const response = await fetch(this.url("/api/v1/integrations/creators"), {
      method: "DELETE",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`CREATORS_INTEGRATION_DISCONNECT_FAILED:${response.status}`);
  }

  private url(path: string): string {
    if (!this.baseUrl) throw new Error("CREATORS_INTEGRATION_API_NOT_CONNECTED");
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const creatorsIntegrationGateway: CreatorsIntegrationGateway = new HttpCreatorsIntegrationGateway(configuredBaseUrl);
