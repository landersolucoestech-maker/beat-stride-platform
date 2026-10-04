export type SessionMembershipRole = "OWNER" | "ADMIN" | "MEMBER" | "FINANCE" | "OPERATIONS";

export interface SessionOrganizationSummary {
  id: string;
  displayName: string;
  organizationType: "INDEPENDENT_ARTIST" | "COMPANY";
  companySubtype: "LABEL" | "PRODUCER" | "PUBLISHER" | "MANAGEMENT" | "AGENCY" | "OTHER" | null;
  role: SessionMembershipRole;
}

export interface SessionUserSummary {
  id: string;
  displayName: string | null;
  email: string;
}

export interface SessionContext {
  authenticated: boolean;
  available: boolean;
  user: SessionUserSummary | null;
  activeOrganization: SessionOrganizationSummary | null;
  memberships: SessionOrganizationSummary[];
  unreadNotifications: number;
}
