export type UgcAllowlistStatus = "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";

export interface UgcAllowlistEntryProps {
  id: string;
  organizationId: string;
  recordingId: string;
  platformCode: string;
  channelReference: string;
  status: UgcAllowlistStatus;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UgcAllowlistEntry {
  private constructor(private props: UgcAllowlistEntryProps) {}

  static request(input: Omit<UgcAllowlistEntryProps, "status" | "validFrom" | "createdAt" | "updatedAt"> & { now: Date }): UgcAllowlistEntry {
    const platformCode = input.platformCode.trim();
    const channelReference = input.channelReference.trim();
    if (!platformCode) throw new Error("UGC_ALLOWLIST_PLATFORM_REQUIRED");
    if (!channelReference) throw new Error("UGC_ALLOWLIST_CHANNEL_REQUIRED");
    return new UgcAllowlistEntry({
      ...input,
      platformCode,
      channelReference,
      status: "PENDING",
      validFrom: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: UgcAllowlistEntryProps): UgcAllowlistEntry {
    return new UgcAllowlistEntry({ ...props });
  }

  activate(validFrom: Date, validUntil: Date | null, now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("UGC_ALLOWLIST_STATE_TRANSITION_INVALID");
    if (validUntil !== null && validUntil <= validFrom) throw new Error("UGC_ALLOWLIST_VALIDITY_INVALID");
    this.props = { ...this.props, status: "ACTIVE", validFrom, validUntil, updatedAt: now };
  }

  revoke(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("UGC_ALLOWLIST_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REVOKED", updatedAt: now };
  }

  expire(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("UGC_ALLOWLIST_STATE_TRANSITION_INVALID");
    if (this.props.validUntil === null || this.props.validUntil > now) throw new Error("UGC_ALLOWLIST_NOT_EXPIRED");
    this.props = { ...this.props, status: "EXPIRED", updatedAt: now };
  }

  isActiveAt(instant: Date): boolean {
    return this.props.status === "ACTIVE" && this.props.validFrom !== null && this.props.validFrom <= instant && (this.props.validUntil === null || this.props.validUntil > instant);
  }

  snapshot(): Readonly<UgcAllowlistEntryProps> {
    return { ...this.props };
  }
}
