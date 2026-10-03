import type { Recording } from "../../domain/Recording";
import type { Release } from "../../domain/Release";
import type { Track } from "../../domain/Track";

export interface CatalogRepository {
  insertRelease(release: Release): Promise<void>;
  insertRecording(recording: Recording): Promise<void>;
  insertTrack(track: Track): Promise<void>;
  findReleaseById(organizationId: string, releaseId: string): Promise<Release | null>;
}
