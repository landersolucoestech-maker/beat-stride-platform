export interface ProfileSettings {
  available: boolean;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  preferredCurrency: string | null;
  organizationName: string | null;
  organizationType: "INDEPENDENT_ARTIST" | "COMPANY" | null;
}

export interface SecuritySettings {
  available: boolean;
  mfaEnabled: boolean | null;
  activeSessions: number | null;
  lastPasswordChangeAt: string | null;
  lastLoginAt: string | null;
}
