const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class LocalDate {
  private constructor(readonly value: string) {}

  static parse(value: string): LocalDate {
    if (!LOCAL_DATE_PATTERN.test(value)) throw new Error("LOCAL_DATE_INVALID_FORMAT");
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new Error("LOCAL_DATE_INVALID_VALUE");
    }
    return new LocalDate(value);
  }

  toString(): string { return this.value; }
}
