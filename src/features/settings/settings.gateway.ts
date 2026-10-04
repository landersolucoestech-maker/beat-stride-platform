import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { ProfileSettings, SecuritySettings } from "./settings.types";

export interface SettingsGateway {
  getProfile(): Promise<ProfileSettings>;
  updateProfile(input: { displayName: string; phone: string | null; preferredCurrency: string | null }): Promise<void>;
  getSecurity(): Promise<SecuritySettings>;
}

class HttpSettingsGateway implements SettingsGateway {
  async getProfile(): Promise<ProfileSettings> {
    if (!isApiConfigured()) return { available: false, displayName: null, email: null, phone: null, preferredCurrency: null, organizationName: null, organizationType: null };
    return this.getJson("/api/v1/settings/profile");
  }

  async updateProfile(input: { displayName: string; phone: string | null; preferredCurrency: string | null }): Promise<void> {
    if (!isApiConfigured()) throw new Error("SETTINGS_API_NOT_CONNECTED");
    await apiRequest("/api/v1/settings/profile", { method: "PATCH", body: JSON.stringify(input) });
  }

  async getSecurity(): Promise<SecuritySettings> {
    if (!isApiConfigured()) return { available: false, mfaEnabled: null, activeSessions: null, lastPasswordChangeAt: null, lastLoginAt: null };
    return this.getJson("/api/v1/settings/security");
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await apiRequest(path);
    return (await response.json()) as T;
  }
}

export const settingsGateway: SettingsGateway = new HttpSettingsGateway();
