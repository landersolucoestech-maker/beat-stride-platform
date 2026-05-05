import { Entity } from "@/core/shared/domain/Entity";
import { UniqueId } from "@/core/shared/domain/UniqueId";

export interface SmartLinkProps {
  releaseId: string;
  slug: string;
  title: string;
  artwork: string;
  destinations: { dsp: string; url: string }[];
  visits: number;
  conversions: number;
  createdAt: string;
}

export class SmartLink extends Entity<SmartLinkProps> {
  static create(props: SmartLinkProps, id?: UniqueId) {
    if (!props.slug) throw new Error("SmartLink: slug obrigatório");
    return new SmartLink(props, id);
  }

  registerVisit() { (this.props as any).visits = this.props.visits + 1; }
  registerConversion() { (this.props as any).conversions = this.props.conversions + 1; }

  get url() { return `https://lnk.music/${this.props.slug}`; }
  get releaseId() { return this.props.releaseId; }
  get slug() { return this.props.slug; }
  get title() { return this.props.title; }
  get artwork() { return this.props.artwork; }
  get destinations() { return this.props.destinations; }
  get visits() { return this.props.visits; }
  get conversions() { return this.props.conversions; }
  get createdAt() { return this.props.createdAt; }
}
