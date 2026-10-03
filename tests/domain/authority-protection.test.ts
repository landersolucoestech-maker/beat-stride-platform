import { describe, expect, it } from "vitest";

import { assertDirectAuthorizationManagementAllowed } from "../../packages/modules/authorization/domain/Authorization";
import { assertProtectionManagementAllowed } from "../../packages/modules/protection/domain/ArtistProtection";

describe("artist authority control", () => {
  it("blocks the artist organization from managing protection while an active company controls it", () => {
    expect(() => assertProtectionManagementAllowed({
      requestingOrganizationId: "artist-org",
      currentControllerOrganizationId: "company-org",
      activeCompanyControllerOrganizationId: "company-org",
    })).toThrow("PROTECTION_MANAGED_BY_ACTIVE_COMPANY_AUTHORITY");
  });

  it("allows the active company controller to manage protection", () => {
    expect(() => assertProtectionManagementAllowed({
      requestingOrganizationId: "company-org",
      currentControllerOrganizationId: "company-org",
      activeCompanyControllerOrganizationId: "company-org",
    })).not.toThrow();
  });

  it("blocks Direct Authorization management outside the active company authority", () => {
    expect(() => assertDirectAuthorizationManagementAllowed({
      requestingOrganizationId: "artist-org",
      activeCompanyControllerOrganizationId: "company-org",
    })).toThrow("DIRECT_AUTHORIZATION_MANAGED_BY_ACTIVE_COMPANY_AUTHORITY");
  });
});
