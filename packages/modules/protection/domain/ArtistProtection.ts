export type ProtectionStatus = "INACTIVE" | "PENDING_ACTIVATION" | "ACTIVE" | "CONTROLLER_TRANSITION" | "SUSPENDED" | "DEACTIVATION_PENDING";

export interface ArtistProtectionProps {
  id: string;
  artistIdentityId: string;
  controllerOrganizationId: string;
  status: ProtectionStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ArtistProtection {
  private constructor(private props: ArtistProtectionProps) {}

  static createInactive(id: string, artistIdentityId: string, controllerOrganizationId: string, now: Date): ArtistProtection {
    return new ArtistProtection({ id, artistIdentityId, controllerOrganizationId, status: "INACTIVE", version: 1, createdAt: now, updatedAt: now });
  }

  beginControllerTransition(nextControllerOrganizationId: string, now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("PROTECTION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, controllerOrganizationId: nextControllerOrganizationId, status: "CONTROLLER_TRANSITION", version: this.props.version + 1, updatedAt: now };
  }

  snapshot(): Readonly<ArtistProtectionProps> { return { ...this.props }; }
}

export function assertProtectionManagementAllowed(input: {
  requestingOrganizationId: string;
  currentControllerOrganizationId: string;
  activeCompanyControllerOrganizationId: string | null;
}): void {
  if (input.activeCompanyControllerOrganizationId && input.requestingOrganizationId !== input.activeCompanyControllerOrganizationId) {
    throw new Error("PROTECTION_MANAGED_BY_ACTIVE_COMPANY_AUTHORITY");
  }
  if (input.requestingOrganizationId !== input.currentControllerOrganizationId && !input.activeCompanyControllerOrganizationId) {
    throw new Error("PROTECTION_CONTROL_DENIED");
  }
}
