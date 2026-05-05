import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";

export type DeliveryStatus = "queued" | "delivering" | "delivered" | "failed" | "takedown";

export interface DeliveryProps {
  releaseId: string;
  dsp: string;
  status: DeliveryStatus;
  submittedAt: string;
  liveAt?: string;
  errorMessage?: string;
}

export class Delivery extends Entity<DeliveryProps> {
  static create(props: DeliveryProps, id?: UniqueId) {
    return new Delivery(props, id);
  }

  markDelivered(when: string) {
    (this.props as any).status = "delivered";
    (this.props as any).liveAt = when;
  }

  markFailed(reason: string) {
    (this.props as any).status = "failed";
    (this.props as any).errorMessage = reason;
  }

  get releaseId() { return this.props.releaseId; }
  get dsp() { return this.props.dsp; }
  get status() { return this.props.status; }
  get submittedAt() { return this.props.submittedAt; }
  get liveAt() { return this.props.liveAt; }
  get errorMessage() { return this.props.errorMessage; }
}
