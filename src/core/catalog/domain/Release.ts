import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Track } from "./Track";

export type ReleaseType = "single" | "ep" | "album";
export type ReleaseStatus = "draft" | "review" | "scheduled" | "live" | "rejected";

export interface ReleaseProps {
  title: string;
  artistId: string;
  artistName: string;
  cover: string;
  type: ReleaseType;
  releaseDate: string;
  status: ReleaseStatus;
  genre: string;
  explicit: boolean;
  tracks: Track[];
  preSaveLink?: string;
  upc?: string;
}

/**
 * Aggregate root do contexto Catalog. Controla integridade do release e tracks.
 */
export class Release extends Entity<ReleaseProps> {
  static create(props: ReleaseProps, id?: UniqueId): Release {
    if (!props.title?.trim()) throw new Error("Release: título obrigatório");
    if (!props.tracks?.length) throw new Error("Release: precisa de ao menos 1 faixa");
    return new Release(props, id);
  }

  submitForReview() {
    if (this.props.status !== "draft") throw new Error("Apenas rascunhos podem ser enviados");
    (this.props as any).status = "review" as ReleaseStatus;
  }

  approve() { (this.props as any).status = "scheduled"; }
  publish() { (this.props as any).status = "live"; }
  reject() { (this.props as any).status = "rejected"; }

  get title() { return this.props.title; }
  get artistId() { return this.props.artistId; }
  get artistName() { return this.props.artistName; }
  get cover() { return this.props.cover; }
  get type() { return this.props.type; }
  get releaseDate() { return this.props.releaseDate; }
  get status() { return this.props.status; }
  get genre() { return this.props.genre; }
  get explicit() { return this.props.explicit; }
  get tracks() { return this.props.tracks; }
  get preSaveLink() { return this.props.preSaveLink; }
  get upc() { return this.props.upc; }
}
