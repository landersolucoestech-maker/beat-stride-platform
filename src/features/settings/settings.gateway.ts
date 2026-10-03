import type { ProfileSettings, SecuritySettings } from "./settings.types";

export interface SettingsGateway {
  getProfile(): Promise<ProfileSettings>;
  updateProfile(input: { displayName: string; phone: string | null; preferredCurrency: string | null }): Promise<void>;
  getSecurity(): Promise<SecuritySettings>;
}

class HttpSettingsGateway implements SettingsGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getProfile(): Promise<ProfileSettings> {
    if (!this.baseUrl) return { available: false, displayName: null, email: null, phone: null, preferredCurrency: null, organizationName: null, organizationType: null };
    return this.getJson("/api/v1/settings/profile");
  }

  async updateProfile(input: { displayName: string; phone: string | null; preferredCurrency: string | null }): Promise<void> {
    if (!this.baseUrl) throw new Error("SETTINGS_API_NOT_CONNECTED");
    const response = await fetch(this.url("/api/v1/settings/profile"), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(`PROFILE_UPDATE_FAILED:${response.status}`);
  }

  async getSecurity(): Promise<SecuritySettings> {
    if (!this.baseUrl) return { available: false, mfaEnabled: null, activeSessions: null, lastPasswordChangeAt: null, lastLoginAt: null };
    return this.getJson("/api/v1/settings/security");
  }

  private url(path: string): string {
    if (!this.baseUrl) throw new Error("SETTINGS_API_NOT_CONNECTED");
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await fetch(this.url(path), { credentials: "include", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`SETTINGS_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as T;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const settingsGateway: SettingsGateway = new HttpSettingsGateway(configuredBaseUrl);
