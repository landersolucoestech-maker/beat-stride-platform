import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";

export interface ArtistProps {
  name: string;
  avatar: string;
  monthlyListeners: number;
  bio?: string;
}

export class Artist extends Entity<ArtistProps> {
  static create(props: ArtistProps, id?: UniqueId): Artist {
    return new Artist(props, id);
  }

  get name() { return this.props.name; }
  get avatar() { return this.props.avatar; }
  get monthlyListeners() { return this.props.monthlyListeners; }
  get bio() { return this.props.bio; }
}
