import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Money } from "@/core/shared/domain/Money";

export interface RoyaltyLineProps {
  trackId: string;
  trackTitle: string;
  artistId: string;
  dsp: string;
  country: string;
  streams: number;
  gross: Money;
  net: Money;
  period: string; // YYYY-MM
}

export class RoyaltyLine extends Entity<RoyaltyLineProps> {
  static create(props: RoyaltyLineProps, id?: UniqueId) {
    if (props.streams < 0) throw new Error("RoyaltyLine: streams negativo");
    return new RoyaltyLine(props, id);
  }
  get trackId() { return this.props.trackId; }
  get trackTitle() { return this.props.trackTitle; }
  get artistId() { return this.props.artistId; }
  get dsp() { return this.props.dsp; }
  get country() { return this.props.country; }
  get streams() { return this.props.streams; }
  get gross() { return this.props.gross; }
  get net() { return this.props.net; }
  get period() { return this.props.period; }
}
