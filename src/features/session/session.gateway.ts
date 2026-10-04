import { ApiRequestError, apiRequest, clearApiSession, isApiConfigured, readApiSession, writeApiSession } from "@/lib/api-client";

import type { SessionContext, SessionMembershipRole, SessionOrganizationSummary } from "./session.types";

export type OrganizationType = "INDEPENDENT_ARTIST" | "COMPANY";
export type CompanySubtype = "LABEL" | "PRODUCER" | "PUBLISHER" | "MANAGEMENT" | "AGENCY" | "OTHER";

interface BackendSessionContext {
  user: { id: string; email: string; displayName: string | null };
  memberships: Array<{
    organizationId: string;
    role: SessionMembershipRole;
    organizationType: OrganizationType;
    companySubtype: CompanySubtype | null;
    displayName: string;
  }>;
}

interface AuthResponse {
  token: string;
  expiresAt: string;
  user: { id: string; email: string; displayName?: string | null };
}

interface RegistrationResponse extends AuthResponse {
  organization: {
    id: string;
    displayName: string;
    organizationType: OrganizationType;
    companySubtype: CompanySubtype | null;
  };
}

export interface RegisterAccountInput {
  email: string;
  password: string;
  organizationType: OrganizationType;
  organizationDisplayName: string;
  companySubtype: CompanySubtype | null;
}

function unauthenticatedContext(available: boolean): SessionContext {
  return {
    authenticated: false,
    available,
    user: null,
    activeOrganization: null,
    memberships: [],
    unreadNotifications: 0,
  };
}

function mapOrganization(membership: BackendSessionContext["memberships"][number]): SessionOrganizationSummary {
  return {
    id: membership.organizationId,
    displayName: membership.displayName,
    organizationType: membership.organizationType,
    companySubtype: membership.companySubtype,
    role: membership.role,
  };
}

class SessionGateway {
  isAvailable(): boolean {
    return isApiConfigured();
  }

  hasSession(): boolean {
    return readApiSession() !== null;
  }

  async getContext(): Promise<SessionContext> {
    if (!isApiConfigured()) return unauthenticatedContext(false);
    const stored = readApiSession();
    if (!stored) return unauthenticatedContext(true);

    try {
      const response = await apiRequest("/api/v1/session", {}, { organizationScoped: false });
      const backend = (await response.json()) as BackendSessionContext;
      const memberships = backend.memberships.map(mapOrganization);
      const activeOrganization = memberships.find((membership) => membership.id === stored.organizationId) ?? memberships[0] ?? null;

      if (activeOrganization && activeOrganization.id !== stored.organizationId) {
        writeApiSession({ ...stored, organizationId: activeOrganization.id });
      }

      return {
        authenticated: true,
        available: true,
        user: { id: backend.user.id, displayName: backend.user.displayName, email: backend.user.email },
        activeOrganization,
        memberships,
        unreadNotifications: 0,
      };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) return unauthenticatedContext(true);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<SessionContext> {
    const response = await apiRequest(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      { organizationScoped: false },
    );
    const auth = (await response.json()) as AuthResponse;
    writeApiSession({ token: auth.token, organizationId: null, expiresAt: auth.expiresAt });
    return this.getContext();
  }

  async register(input: RegisterAccountInput): Promise<SessionContext> {
    if (input.organizationType === "COMPANY" && !input.companySubtype) {
      throw new Error("COMPANY_SUBTYPE_REQUIRED");
    }

    const organization = input.organizationType === "INDEPENDENT_ARTIST"
      ? { type: "INDEPENDENT_ARTIST" as const, displayName: input.organizationDisplayName }
      : {
          type: "COMPANY" as const,
          displayName: input.organizationDisplayName,
          companySubtype: input.companySubtype as CompanySubtype,
        };

    const response = await apiRequest(
      "/api/v1/auth/register",
      { method: "POST", body: JSON.stringify({ email: input.email, password: input.password, organization }) },
      { organizationScoped: false },
    );
    const auth = (await response.json()) as RegistrationResponse;
    writeApiSession({ token: auth.token, organizationId: auth.organization.id, expiresAt: auth.expiresAt });
    return this.getContext();
  }

  async selectOrganization(organizationId: string): Promise<void> {
    const current = readApiSession();
    if (!current) throw new Error("SESSION_REQUIRED");
    const context = await this.getContext();
    if (!context.authenticated || !context.memberships.some((membership) => membership.id === organizationId)) {
      throw new Error("ORGANIZATION_MEMBERSHIP_REQUIRED");
    }
    writeApiSession({ ...current, organizationId });
  }

  async logout(): Promise<void> {
    try {
      if (readApiSession()) await apiRequest("/api/v1/auth/logout", { method: "POST" }, { organizationScoped: false });
    } finally {
      clearApiSession();
    }
  }
}

export const sessionGateway = new SessionGateway();
