import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";

export type FraudSeverity = "low" | "medium" | "high" | "critical";
export type FraudStatus = "open" | "investigating" | "confirmed" | "dismissed";

export interface FraudAlertProps {
  trackId: string;
  trackTitle: string;
  artistName: string;
  dsp: string;
  detectedAt: string;
  reason: string;
  suspiciousStreams: number;
  severity: FraudSeverity;
  status: FraudStatus;
}

export class FraudAlert extends Entity<FraudAlertProps> {
  static create(props: FraudAlertProps, id?: UniqueId) {
    return new FraudAlert(props, id);
  }
  confirm() { (this.props as any).status = "confirmed"; }
  dismiss() { (this.props as any).status = "dismissed"; }
  investigate() { (this.props as any).status = "investigating"; }

  get trackId() { return this.props.trackId; }
  get trackTitle() { return this.props.trackTitle; }
  get artistName() { return this.props.artistName; }
  get dsp() { return this.props.dsp; }
  get detectedAt() { return this.props.detectedAt; }
  get reason() { return this.props.reason; }
  get suspiciousStreams() { return this.props.suspiciousStreams; }
  get severity() { return this.props.severity; }
  get status() { return this.props.status; }
}
