import { UseCase } from "@/core/shared/application/UseCase";
import { WalletRepository, WithdrawalRepository } from "../domain/WalletRepository";
import { WalletDTO, WalletMapper, WithdrawalDTO } from "./WalletMapper";

export class GetWalletUseCase implements UseCase<string, WalletDTO | null> {
  constructor(private readonly repo: WalletRepository) {}
  async execute(artistId: string) {
    const w = await this.repo.findByArtistId(artistId);
    return w ? WalletMapper.walletToDTO(w) : null;
  }
}

export class ListWithdrawalsUseCase implements UseCase<void, WithdrawalDTO[]> {
  constructor(private readonly repo: WithdrawalRepository) {}
  async execute() {
    const items = await this.repo.findAll();
    return items.map(WalletMapper.withdrawalToDTO);
  }
}
