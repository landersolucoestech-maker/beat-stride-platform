export type ContentIdEnrollmentStatus =
  | "DRAFT"
  | "ELIGIBILITY_CHECK"
  | "INELIGIBLE"
  | "AUTHORIZATION_REQUIRED"
  | "READY"
  | "SUBMITTED"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED"
  | "DEACTIVATION_PENDING"
  | "DEACTIVATED";

export interface ContentIdEnrollmentProps {
  id: string;
  organizationId: string;
  recordingId: string;
  status: ContentIdEnrollmentStatus;
  providerCode: string | null;
  providerReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<ContentIdEnrollmentStatus, readonly ContentIdEnrollmentStatus[]> = {
  DRAFT: ["ELIGIBILITY_CHECK", "DEACTIVATED"],
  ELIGIBILITY_CHECK: ["INELIGIBLE", "AUTHORIZATION_REQUIRED", "READY", "REJECTED"],
  INELIGIBLE: ["ELIGIBILITY_CHECK", "DEACTIVATED"],
  AUTHORIZATION_REQUIRED: ["ELIGIBILITY_CHECK", "READY", "REJECTED"],
  READY: ["SUBMITTED", "DEACTIVATED"],
  SUBMITTED: ["ACTIVE", "REJECTED", "SUSPENDED"],
  ACTIVE: ["SUSPENDED", "DEACTIVATION_PENDING"],
  REJECTED: ["ELIGIBILITY_CHECK", "DEACTIVATED"],
  SUSPENDED: ["ACTIVE", "DEACTIVATION_PENDING"],
  DEACTIVATION_PENDING: ["DEACTIVATED"],
  DEACTIVATED: [],
};

export class ContentIdEnrollment {
  private constructor(private props: ContentIdEnrollmentProps) {}

  static draft(input: Omit<ContentIdEnrollmentProps, "status" | "providerCode" | "providerReference" | "createdAt" | "updatedAt"> & { now: Date }): ContentIdEnrollment {
    return new ContentIdEnrollment({
      ...input,
      status: "DRAFT",
      providerCode: null,
      providerReference: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: ContentIdEnrollmentProps): ContentIdEnrollment {
    return new ContentIdEnrollment({ ...props });
  }

  startEligibilityCheck(now: Date): void { this.transitionTo("ELIGIBILITY_CHECK", now); }
  markIneligible(now: Date): void { this.transitionTo("INELIGIBLE", now); }
  requireAuthorization(now: Date): void { this.transitionTo("AUTHORIZATION_REQUIRED", now); }
  markReady(now: Date): void { this.transitionTo("READY", now); }
  markRejected(now: Date): void { this.transitionTo("REJECTED", now); }
  suspend(now: Date): void { this.transitionTo("SUSPENDED", now); }
  reactivate(now: Date): void { this.transitionTo("ACTIVE", now); }
  requestDeactivation(now: Date): void { this.transitionTo("DEACTIVATION_PENDING", now); }
  deactivate(now: Date): void { this.transitionTo("DEACTIVATED", now); }

  submit(providerCode: string, providerReference: string, now: Date): void {
    const code = providerCode.trim();
    const reference = providerReference.trim();
    if (!code || !reference) throw new Error("CONTENT_ID_PROVIDER_REFERENCE_REQUIRED");
    if (!allowedTransitions[this.props.status].includes("SUBMITTED")) {
      throw new Error("CONTENT_ID_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "SUBMITTED",
      providerCode: code,
      providerReference: reference,
      updatedAt: now,
    };
  }

  activate(now: Date): void {
    if (!this.props.providerReference) throw new Error("CONTENT_ID_PROVIDER_REFERENCE_REQUIRED");
    this.transitionTo("ACTIVE", now);
  }

  snapshot(): Readonly<ContentIdEnrollmentProps> {
    return { ...this.props };
  }

  private transitionTo(next: ContentIdEnrollmentStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) {
      throw new Error("CONTENT_ID_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
