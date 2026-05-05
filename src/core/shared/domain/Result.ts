/**
 * Padrão Result para evitar exceptions em fluxos de aplicação.
 */
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value: T | null,
    public readonly error: string | null,
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(true, value, null);
  }

  static fail<T>(error: string): Result<T> {
    return new Result<T>(false, null, error);
  }
}
