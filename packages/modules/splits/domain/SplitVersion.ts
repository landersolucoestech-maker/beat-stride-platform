export interface SplitParticipant {
  beneficiaryId: string;
  share: string;
}

export interface SplitVersionProps {
  id: string;
  organizationId: string;
  resourceType: "RELEASE" | "RECORDING";
  resourceId: string;
  version: number;
  participants: SplitParticipant[];
  effectiveFrom: Date;
  createdAt: Date;
}

export class SplitVersion {
  private constructor(private readonly props: SplitVersionProps) {}
  static create(props: SplitVersionProps): SplitVersion {
    if (props.version < 1 || props.participants.length === 0) throw new Error("SPLIT_VERSION_INVALID");
    return new SplitVersion(props);
  }
  snapshot(): Readonly<SplitVersionProps> { return { ...this.props, participants: this.props.participants.map((participant) => ({ ...participant })) }; }
}
