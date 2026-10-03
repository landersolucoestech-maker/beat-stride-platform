import type { SessionContext } from "./session.types";

export interface SessionGateway {
  getContext(): Promise<SessionContext>;
}

class HttpSessionGateway implements SessionGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getContext(): Promise<SessionContext> {
    if (!this.baseUrl) {
      return {
        authenticated: false,
        available: false,
        user: null,
        activeOrganization: null,
        memberships: [],
        unreadNotifications: 0,
      };
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/session`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (response.status === 401) {
      return {
        authenticated: false,
        available: true,
        user: null,
        activeOrganization: null,
        memberships: [],
        unreadNotifications: 0,
      };
    }

    if (!response.ok) throw new Error(`SESSION_CONTEXT_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as SessionContext;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const sessionGateway: SessionGateway = new HttpSessionGateway(configuredBaseUrl);
