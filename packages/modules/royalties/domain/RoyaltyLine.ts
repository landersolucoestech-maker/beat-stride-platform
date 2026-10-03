import type { Money } from "../../shared/domain/Money";

export interface RoyaltyLineProps {
  id: string;
  statementId: string;
  sourceLineReference: string;
  releaseId: string | null;
  recordingId: string | null;
  territoryCode: string | null;
  destinationCode: string | null;
  usageType: string;
  usageCount: string | null;
  grossAmount: Money;
  matched: boolean;
  createdAt: Date;
}

export class RoyaltyLine {
  private constructor(private readonly props: RoyaltyLineProps) {}
  static create(props: RoyaltyLineProps): RoyaltyLine { return new RoyaltyLine(props); }
  snapshot(): Readonly<RoyaltyLineProps> { return { ...this.props }; }
}
