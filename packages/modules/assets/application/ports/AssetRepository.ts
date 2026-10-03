import type { Asset } from "../../domain/Asset";

export interface AssetRepository {
  insert(asset: Asset): Promise<void>;
  update(asset: Asset): Promise<void>;
  findById(organizationId: string, assetId: string): Promise<Asset | null>;
}
