export type TransferStatus =
  | "DRAFT"
  | "VALIDATING"
  | "CONFLICT_CHECK"
  | "CORRECTION_REQUIRED"
  | "READY"
  | "IN_PROGRESS"
  | "PARTIAL"
  | "FAILED"
  | "COMPLETED";

export interface CatalogTransferProps {
  id: string;
  organizationId: string;
  direction: "IMPORT" | "EXPORT";
  status: TransferStatus;
  preserveIdentifiers: boolean;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<TransferStatus, readonly TransferStatus[]> = {
  DRAFT: ["VALIDATING"],
  VALIDATING: ["CONFLICT_CHECK", "CORRECTION_REQUIRED", "FAILED"],
  CONFLICT_CHECK: ["CORRECTION_REQUIRED", "READY", "FAILED"],
  CORRECTION_REQUIRED: ["VALIDATING"],
  READY: ["IN_PROGRESS"],
  IN_PROGRESS: ["PARTIAL", "FAILED", "COMPLETED"],
  PARTIAL: ["IN_PROGRESS", "CORRECTION_REQUIRED", "FAILED", "COMPLETED"],
  FAILED: ["VALIDATING", "IN_PROGRESS"],
  COMPLETED: [],
};

export class CatalogTransfer {
  private constructor(private props: CatalogTransferProps) {}

  static createDraft(input: Omit<CatalogTransferProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): CatalogTransfer {
    if (!Number.isInteger(input.itemCount) || input.itemCount < 1) throw new Error("TRANSFER_ITEM_COUNT_INVALID");
    return new CatalogTransfer({ ...input, status: "DRAFT", createdAt: input.now, updatedAt: input.now });
  }

  static restore(props: CatalogTransferProps): CatalogTransfer {
    return new CatalogTransfer({ ...props });
  }

  startValidation(now: Date): void { this.transitionTo("VALIDATING", now); }
  startConflictCheck(now: Date): void { this.transitionTo("CONFLICT_CHECK", now); }
  requireCorrection(now: Date): void { this.transitionTo("CORRECTION_REQUIRED", now); }
  markReady(now: Date): void { this.transitionTo("READY", now); }
  start(now: Date): void { this.transitionTo("IN_PROGRESS", now); }
  markPartial(now: Date): void { this.transitionTo("PARTIAL", now); }
  fail(now: Date): void { this.transitionTo("FAILED", now); }
  complete(now: Date): void { this.transitionTo("COMPLETED", now); }

  snapshot(): Readonly<CatalogTransferProps> {
    return { ...this.props };
  }

  private transitionTo(next: TransferStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) {
      throw new Error("TRANSFER_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
