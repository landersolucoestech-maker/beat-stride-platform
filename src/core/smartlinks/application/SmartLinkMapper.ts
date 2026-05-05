import { UniqueId } from "@/core/shared/domain/UniqueId";
import { SmartLink } from "../domain/SmartLink";

export interface SmartLinkDTO {
  id: string;
  releaseId: string;
  slug: string;
  title: string;
  artwork: string;
  url: string;
  destinations: { dsp: string; url: string }[];
  visits: number;
  conversions: number;
  conversionRate: number;
  createdAt: string;
}

export class SmartLinkMapper {
  static toDTO(s: SmartLink): SmartLinkDTO {
    const rate = s.visits === 0 ? 0 : (s.conversions / s.visits) * 100;
    return {
      id: s.id.toString(),
      releaseId: s.releaseId,
      slug: s.slug,
      title: s.title,
      artwork: s.artwork,
      url: s.url,
      destinations: s.destinations,
      visits: s.visits,
      conversions: s.conversions,
      conversionRate: Number(rate.toFixed(2)),
      createdAt: s.createdAt,
    };
  }

  static toDomain(dto: SmartLinkDTO): SmartLink {
    return SmartLink.create(
      {
        releaseId: dto.releaseId,
        slug: dto.slug,
        title: dto.title,
        artwork: dto.artwork,
        destinations: dto.destinations,
        visits: dto.visits,
        conversions: dto.conversions,
        createdAt: dto.createdAt,
      },
      new UniqueId(dto.id),
    );
  }
}
