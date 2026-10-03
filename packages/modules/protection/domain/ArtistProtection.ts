export type ProtectionStatus =
  | "INACTIVE"
  | "PENDING_ACTIVATION"
  | "ACTIVE"
  | "CONTROLLER_TRANSITION"
  | "SUSPENDED"
  | "DEACTIVATION_PENDING";

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
    return new ArtistProtection({
      id,
      artistIdentityId,
      controllerOrganizationId,
      status: "INACTIVE",
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ArtistProtectionProps): ArtistProtection {
    return new ArtistProtection({ ...props });
  }

  requestActivation(now: Date): void {
    this.assertStatus("INACTIVE");
    this.apply("PENDING_ACTIVATION", now);
  }

  activate(now: Date): void {
    this.assertStatus("PENDING_ACTIVATION");
    this.apply("ACTIVE", now);
  }

  suspend(now: Date): void {
    this.assertStatus("ACTIVE");
    this.apply("SUSPENDED", now);
  }

  resume(now: Date): void {
    this.assertStatus("SUSPENDED");
    this.apply("ACTIVE", now);
  }

  requestDeactivation(now: Date): void {
    if (!["ACTIVE", "SUSPENDED"].includes(this.props.status)) {
      throw new Error("PROTECTION_STATE_TRANSITION_INVALID");
    }
    this.apply("DEACTIVATION_PENDING", now);
  }

  deactivate(now: Date): void {
    this.assertStatus("DEACTIVATION_PENDING");
    this.apply("INACTIVE", now);
  }

  beginControllerTransition(nextControllerOrganizationId: string, now: Date): void {
    this.assertStatus("ACTIVE");
    const nextController = nextControllerOrganizationId.trim();
    if (!nextController || nextController === this.props.controllerOrganizationId) {
      throw new Error("PROTECTION_CONTROLLER_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      controllerOrganizationId: nextController,
      status: "CONTROLLER_TRANSITION",
      version: this.props.version + 1,
      updatedAt: now,
    };
  }

  completeControllerTransition(now: Date): void {
    this.assertStatus("CONTROLLER_TRANSITION");
    this.apply("ACTIVE", now);
  }

  snapshot(): Readonly<ArtistProtectionProps> {
    return { ...this.props };
  }

  private assertStatus(expected: ProtectionStatus): void {
    if (this.props.status !== expected) throw new Error("PROTECTION_STATE_TRANSITION_INVALID");
  }

  private apply(status: ProtectionStatus, now: Date): void {
    this.props = {
      ...this.props,
      status,
      version: this.props.version + 1,
      updatedAt: now,
    };
  }
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
