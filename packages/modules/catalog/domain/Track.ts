export interface TrackProps {
  id: string;
  releaseId: string;
  recordingId: string;
  sequence: number;
  title: string;
  explicit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Track {
  private constructor(private readonly props: TrackProps) {}

  static create(input: Omit<TrackProps, "createdAt" | "updatedAt"> & { now: Date }): Track {
    if (input.sequence < 1 || !Number.isInteger(input.sequence)) throw new Error("TRACK_SEQUENCE_INVALID");
    const title = input.title.trim();
    if (!title) throw new Error("TRACK_TITLE_REQUIRED");
    return new Track({ ...input, title, createdAt: input.now, updatedAt: input.now });
  }

  static restore(props: TrackProps): Track { return new Track(props); }
  snapshot(): Readonly<TrackProps> { return { ...this.props }; }
}
