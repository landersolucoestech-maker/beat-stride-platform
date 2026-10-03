import type { LocalDate } from "../../shared/domain/LocalDate";

export interface ReleaseMetadataProps {
  id: string;
  releaseId: string;
  releaseVersion: number;
  language: string;
  primaryGenre: string;
  releaseDate: LocalDate;
  copyrightLine: string;
  phonographicCopyrightLine: string;
  createdAt: Date;
}

export class ReleaseMetadata {
  private constructor(private readonly props: ReleaseMetadataProps) {}

  static create(input: ReleaseMetadataProps): ReleaseMetadata {
    if (!input.language.trim()) throw new Error("METADATA_LANGUAGE_REQUIRED");
    if (!input.primaryGenre.trim()) throw new Error("METADATA_PRIMARY_GENRE_REQUIRED");
    if (!input.copyrightLine.trim()) throw new Error("METADATA_C_LINE_REQUIRED");
    if (!input.phonographicCopyrightLine.trim()) throw new Error("METADATA_P_LINE_REQUIRED");
    if (input.releaseVersion < 1) throw new Error("METADATA_RELEASE_VERSION_INVALID");
    return new ReleaseMetadata(input);
  }

  snapshot(): Readonly<ReleaseMetadataProps> { return { ...this.props }; }
}
