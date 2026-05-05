import { SmartLink } from "./SmartLink";

export interface SmartLinkRepository {
  findAll(): Promise<SmartLink[]>;
  findByReleaseId(releaseId: string): Promise<SmartLink[]>;
  save(s: SmartLink): Promise<void>;
}
