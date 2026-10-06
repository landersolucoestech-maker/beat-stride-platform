import type { AssetType } from "../../domain/Asset";

export interface CreateAssetUploadIntentInput {
  organizationId: string;
  assetId: string;
  assetType: AssetType;
  storageKey: string;
  fileName: string;
  contentType: string;
  byteSize: number;
}

export interface AssetUploadIntent {
  method: "PUT" | "POST";
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface AssetStorage {
  isConfigured(): boolean;
  createUploadIntent(input: CreateAssetUploadIntentInput): Promise<AssetUploadIntent>;
}
