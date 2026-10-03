export type StatementStatus =
  | "RECEIVED"
  | "PARSING"
  | "NORMALIZING"
  | "MATCHING"
  | "EXCEPTIONS"
  | "RECONCILING"
  | "POSTED"
  | "CLOSED";

export interface StatementProps {
  id: string;
  organizationId: string | null;
  providerCode: string;
  sourceReference: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  status: StatementStatus;
  fileAssetId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<StatementStatus, readonly StatementStatus[]> = {
  RECEIVED: ["PARSING"],
  PARSING: ["NORMALIZING", "EXCEPTIONS"],
  NORMALIZING: ["MATCHING", "EXCEPTIONS"],
  MATCHING: ["EXCEPTIONS", "RECONCILING"],
  EXCEPTIONS: ["PARSING", "NORMALIZING", "MATCHING", "RECONCILING"],
  RECONCILING: ["EXCEPTIONS", "POSTED"],
  POSTED: ["CLOSED"],
  CLOSED: [],
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export class Statement {
  private constructor(private props: StatementProps) {}

  static receive(input: Omit<StatementProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): Statement {
    const providerCode = input.providerCode.trim();
    const sourceReference = input.sourceReference.trim();
    if (!providerCode) throw new Error("STATEMENT_PROVIDER_REQUIRED");
    if (!sourceReference) throw new Error("STATEMENT_SOURCE_REFERENCE_REQUIRED");
    if (!ISO_DATE_PATTERN.test(input.periodStart) || !ISO_DATE_PATTERN.test(input.periodEnd)) {
      throw new Error("STATEMENT_PERIOD_INVALID");
    }
    if (input.periodEnd < input.periodStart) throw new Error("STATEMENT_PERIOD_INVALID");
    if (!CURRENCY_PATTERN.test(input.currency)) throw new Error("STATEMENT_CURRENCY_INVALID");

    return new Statement({
      ...input,
      providerCode,
      sourceReference,
      status: "RECEIVED",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: StatementProps): Statement {
    return new Statement({ ...props });
  }

  startParsing(now: Date): void {
    this.transitionTo("PARSING", now);
  }

  startNormalization(now: Date): void {
    this.transitionTo("NORMALIZING", now);
  }

  startMatching(now: Date): void {
    this.transitionTo("MATCHING", now);
  }

  markExceptions(now: Date): void {
    this.transitionTo("EXCEPTIONS", now);
  }

  startReconciliation(now: Date): void {
    this.transitionTo("RECONCILING", now);
  }

  post(now: Date): void {
    this.transitionTo("POSTED", now);
  }

  close(now: Date): void {
    this.transitionTo("CLOSED", now);
  }

  snapshot(): Readonly<StatementProps> {
    return { ...this.props };
  }

  private transitionTo(nextStatus: StatementStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(nextStatus)) {
      throw new Error("STATEMENT_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: nextStatus, updatedAt: now };
  }
}
