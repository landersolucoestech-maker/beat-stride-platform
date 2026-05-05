/**
 * Contrato base de um caso de uso da camada de aplicação.
 */
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output> | Output;
}
