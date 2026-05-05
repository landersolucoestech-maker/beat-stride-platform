import { Artist } from "../domain/Artist";
import { Release } from "../domain/Release";
import { Track } from "../domain/Track";
import { UniqueId } from "@/core/shared/domain/UniqueId";

export interface ArtistDTO {
  id: string;
  name: string;
  avatar: string;
  monthlyListeners: number;
  bio?: string;
}

export interface TrackDTO {
  id: string;
  title: string;
  duration: string;
  isrc: string;
  explicit: boolean;
}

export interface ReleaseDTO {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  cover: string;
  type: "single" | "ep" | "album";
  releaseDate: string;
  status: "draft" | "review" | "scheduled" | "live" | "rejected";
  genre: string;
  explicit: boolean;
  tracks: TrackDTO[];
  preSaveLink?: string;
  upc?: string;
}

/**
 * Converte entre entidades de domínio e DTOs de aplicação/UI.
 * Camada de domínio nunca vaza para a UI sem passar por mappers.
 */
export class CatalogMapper {
  static artistToDTO(a: Artist): ArtistDTO {
    return {
      id: a.id.toString(),
      name: a.name,
      avatar: a.avatar,
      monthlyListeners: a.monthlyListeners,
      bio: a.bio,
    };
  }

  static artistToDomain(dto: ArtistDTO): Artist {
    return Artist.create(
      {
        name: dto.name,
        avatar: dto.avatar,
        monthlyListeners: dto.monthlyListeners,
        bio: dto.bio,
      },
      new UniqueId(dto.id),
    );
  }

  static trackToDTO(t: Track): TrackDTO {
    return {
      id: t.id.toString(),
      title: t.title,
      duration: t.duration,
      isrc: t.isrc,
      explicit: t.explicit,
    };
  }

  static trackToDomain(dto: TrackDTO): Track {
    return Track.create(
      { title: dto.title, duration: dto.duration, isrc: dto.isrc, explicit: dto.explicit },
      new UniqueId(dto.id),
    );
  }

  static releaseToDTO(r: Release): ReleaseDTO {
    return {
      id: r.id.toString(),
      title: r.title,
      artistId: r.artistId,
      artistName: r.artistName,
      cover: r.cover,
      type: r.type,
      releaseDate: r.releaseDate,
      status: r.status,
      genre: r.genre,
      explicit: r.explicit,
      tracks: r.tracks.map(CatalogMapper.trackToDTO),
      preSaveLink: r.preSaveLink,
      upc: r.upc,
    };
  }

  static releaseToDomain(dto: ReleaseDTO): Release {
    return Release.create(
      {
        title: dto.title,
        artistId: dto.artistId,
        artistName: dto.artistName,
        cover: dto.cover,
        type: dto.type,
        releaseDate: dto.releaseDate,
        status: dto.status,
        genre: dto.genre,
        explicit: dto.explicit,
        tracks: dto.tracks.map(CatalogMapper.trackToDomain),
        preSaveLink: dto.preSaveLink,
        upc: dto.upc,
      },
      new UniqueId(dto.id),
    );
  }
}
