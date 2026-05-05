import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Money } from "@/core/shared/domain/Money";
import { RoyaltyLine } from "../domain/RoyaltyLine";

export interface RoyaltyLineDTO {
  id: string;
  trackId: string;
  trackTitle: string;
  artistId: string;
  dsp: string;
  country: string;
  streams: number;
  grossAmount: number;
  netAmount: number;
  currency: string;
  period: string;
}

export class RoyaltyMapper {
  static toDTO(l: RoyaltyLine): RoyaltyLineDTO {
    return {
      id: l.id.toString(),
      trackId: l.trackId,
      trackTitle: l.trackTitle,
      artistId: l.artistId,
      dsp: l.dsp,
      country: l.country,
      streams: l.streams,
      grossAmount: l.gross.amount,
      netAmount: l.net.amount,
      currency: l.gross.currency,
      period: l.period,
    };
  }

  static toDomain(dto: RoyaltyLineDTO): RoyaltyLine {
    return RoyaltyLine.create(
      {
        trackId: dto.trackId,
        trackTitle: dto.trackTitle,
        artistId: dto.artistId,
        dsp: dto.dsp,
        country: dto.country,
        streams: dto.streams,
        gross: new Money(dto.grossAmount, dto.currency),
        net: new Money(dto.netAmount, dto.currency),
        period: dto.period,
      },
      new UniqueId(dto.id),
    );
  }
}
