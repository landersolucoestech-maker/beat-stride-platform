export interface SplitParticipantView {
  beneficiaryId: string;
  beneficiaryName: string;
  share: string;
}

export interface SplitVersionView {
  id: string;
  resourceType: "RELEASE" | "RECORDING";
  resourceId: string;
  resourceTitle: string;
  version: number;
  effectiveFrom: string;
  participants: SplitParticipantView[];
}

export interface SplitOverview {
  available: boolean;
  items: SplitVersionView[];
}
