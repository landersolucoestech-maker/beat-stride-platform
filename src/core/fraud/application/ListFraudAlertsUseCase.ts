import { UseCase } from "@/core/shared/application/UseCase";
import { FraudRepository } from "../domain/FraudRepository";
import { FraudAlertDTO, FraudMapper } from "./FraudMapper";

export class ListFraudAlertsUseCase implements UseCase<void, FraudAlertDTO[]> {
  constructor(private readonly repo: FraudRepository) {}
  async execute() {
    return (await this.repo.findAll()).map(FraudMapper.toDTO);
  }
}
