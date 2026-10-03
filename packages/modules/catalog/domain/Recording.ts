export interface RecordingProps {
  id: string;
  organizationId: string;
  title: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Recording {
  private constructor(private readonly props: RecordingProps) {}

  static create(input: Omit<RecordingProps, "version" | "createdAt" | "updatedAt"> & { now: Date }): Recording {
    const title = input.title.trim();
    if (!title) throw new Error("RECORDING_TITLE_REQUIRED");
    return new Recording({ ...input, title, version: 1, createdAt: input.now, updatedAt: input.now });
  }

  static restore(props: RecordingProps): Recording { return new Recording(props); }
  snapshot(): Readonly<RecordingProps> { return { ...this.props }; }
}
