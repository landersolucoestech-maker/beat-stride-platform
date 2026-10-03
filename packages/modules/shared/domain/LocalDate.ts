const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class LocalDate {
  private constructor(readonly value: string) {}

  static parse(value: string): LocalDate {
    if (!LOCAL_DATE_PATTERN.test(value)) throw new Error("LOCAL_DATE_INVALID_FORMAT");

    const parts = value.split("-");
    if (parts.length !== 3) throw new Error("LOCAL_DATE_INVALID_FORMAT");

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      throw new Error("LOCAL_DATE_INVALID_VALUE");
    }

    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new Error("LOCAL_DATE_INVALID_VALUE");
    }
    return new LocalDate(value);
  }

  toString(): string {
    return this.value;
  }
}
