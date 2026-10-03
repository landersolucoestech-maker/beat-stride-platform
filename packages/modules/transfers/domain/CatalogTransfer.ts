export type TransferStatus = "DRAFT" | "VALIDATING" | "CONFLICT_CHECK" | "CORRECTION_REQUIRED" | "READY" | "IN_PROGRESS" | "PARTIAL" | "FAILED" | "COMPLETED";

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

export class CatalogTransfer {
  private constructor(private props: CatalogTransferProps) {}
  static createDraft(input: Omit<CatalogTransferProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): CatalogTransfer {
    if (input.itemCount < 1) throw new Error("TRANSFER_ITEM_COUNT_INVALID");
    return new CatalogTransfer({ ...input, status: "DRAFT", createdAt: input.now, updatedAt: input.now });
  }
  moveTo(next: TransferStatus, now: Date): void {
    if (["FAILED", "COMPLETED"].includes(this.props.status)) throw new Error("TRANSFER_TERMINAL_STATE");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
  snapshot(): Readonly<CatalogTransferProps> { return { ...this.props }; }
}
