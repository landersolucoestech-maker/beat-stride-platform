export type AssetType = "ARTWORK" | "AUDIO_MASTER" | "VIDEO_MASTER" | "DOCUMENT" | "OTHER";
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
    if (!input.storageKey.trim()) throw new Error("ASSET_STORAGE_KEY_REQUIRED");
    return new Asset({ ...input, status: "PENDING_UPLOAD", byteSize: null, checksumSha256: null, createdAt: input.now, updatedAt: input.now });
  }

  markAvailable(byteSize: number, checksumSha256: string, now: Date): void {
    if (this.props.status !== "PENDING_UPLOAD" && this.props.status !== "QUARANTINED") throw new Error("ASSET_STATE_TRANSITION_INVALID");
    if (!Number.isInteger(byteSize) || byteSize <= 0) throw new Error("ASSET_BYTE_SIZE_INVALID");
    if (!/^[a-f0-9]{64}$/i.test(checksumSha256)) throw new Error("ASSET_SHA256_INVALID");
    this.props = { ...this.props, status: "AVAILABLE", byteSize, checksumSha256: checksumSha256.toLowerCase(), updatedAt: now };
  }

  snapshot(): Readonly<AssetProps> { return { ...this.props }; }
}
