import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";

export interface TrackProps {
  title: string;
  duration: string;
  isrc: string;
  explicit: boolean;
}

export class Track extends Entity<TrackProps> {
  static create(props: TrackProps, id?: UniqueId): Track {
    return new Track(props, id);
  }
  get title() { return this.props.title; }
  get duration() { return this.props.duration; }
  get isrc() { return this.props.isrc; }
  get explicit() { return this.props.explicit; }
}
