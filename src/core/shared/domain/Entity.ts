import { UniqueId } from "./UniqueId";

/**
 * Entidade base do domínio. Identidade definida por UniqueId.
 */
export abstract class Entity<Props> {
  protected readonly _id: UniqueId;
  protected readonly props: Props;

  constructor(props: Props, id?: UniqueId) {
    this._id = id ?? new UniqueId();
    this.props = props;
  }

  get id() {
    return this._id;
  }

  equals(other?: Entity<Props>) {
    if (!other) return false;
    return this._id.equals(other._id);
  }
}
