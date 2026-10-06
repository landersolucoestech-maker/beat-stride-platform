export type AssetType =
  | "ARTWORK"
  | "AUDIO_MASTER"
  | "VIDEO_MASTER"
  | "DOCUMENT"
  | "OTHER"
  | "MARKETING_IMAGE"
  | "MARKETING_VIDEO"
  | "MARKETING_AUDIO";
export type AssetStatus = "PENDING_UPLOAD" | "AVAILABLE" | "QUARANTINED" | "REJECTED" | "DELETED";

export interface AssetProps {
  id: string;
  organizationId: string;
  type: AssetType;
  status: AssetStatus;
  storageKey: string;
  fileName: string;
  contentType: string;
  byteSize: number | null;
  checksumSha256: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Asset {
  private constructor(private props: AssetProps) {}

  static beginUpload(input: Omit<AssetProps, "status" | "byteSize" | "checksumSha256" | "createdAt" | "updatedAt"> & { now: Date }): Asset {
    const storageKey = input.storageKey.trim();
    const fileName = input.fileName.trim();
    const contentType = input.contentType.trim();
    if (!storageKey) throw new Error("ASSET_STORAGE_KEY_REQUIRED");
    if (!fileName) throw new Error("ASSET_FILE_NAME_REQUIRED");
    if (!contentType) throw new Error("ASSET_CONTENT_TYPE_REQUIRED");
    return new Asset({
      ...input,
      storageKey,
      fileName,
      contentType,
      status: "PENDING_UPLOAD",
      byteSize: null,
      checksumSha256: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: AssetProps): Asset {
    return new Asset({ ...props });
  }

  markAvailable(byteSize: number, checksumSha256: string, now: Date): void {
    if (this.props.status !== "PENDING_UPLOAD" && this.props.status !== "QUARANTINED") throw new Error("ASSET_STATE_TRANSITION_INVALID");
    if (!Number.isInteger(byteSize) || byteSize <= 0) throw new Error("ASSET_BYTE_SIZE_INVALID");
    if (!/^[a-f0-9]{64}$/i.test(checksumSha256)) throw new Error("ASSET_SHA256_INVALID");
    this.props = {
      ...this.props,
      status: "AVAILABLE",
      byteSize,
      checksumSha256: checksumSha256.toLowerCase(),
      updatedAt: now,
    };
  }

  quarantine(now: Date): void {
    if (!["PENDING_UPLOAD", "AVAILABLE"].includes(this.props.status)) throw new Error("ASSET_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "QUARANTINED", updatedAt: now };
  }

  reject(now: Date): void {
    if (!["PENDING_UPLOAD", "QUARANTINED"].includes(this.props.status)) throw new Error("ASSET_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REJECTED", updatedAt: now };
  }

  delete(now: Date): void {
    if (this.props.status === "DELETED") throw new Error("ASSET_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "DELETED", updatedAt: now };
  }

  isUsable(): boolean {
    return this.props.status === "AVAILABLE" && this.props.byteSize !== null && this.props.checksumSha256 !== null;
  }

  snapshot(): Readonly<AssetProps> {
    return { ...this.props };
  }
}
