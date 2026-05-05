/**
 * Identidade única de uma entidade do domínio.
 */
export class UniqueId {
  private readonly value: string;

  constructor(value?: string) {
    this.value = value ?? crypto.randomUUID();
  }

  toString() {
    return this.value;
  }

  equals(other: UniqueId) {
    return this.value === other.value;
  }
}
