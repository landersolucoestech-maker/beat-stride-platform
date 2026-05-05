import { UseCase } from "@/core/shared/application/UseCase";
import { Money } from "@/core/shared/domain/Money";
import { Withdrawal } from "../domain/Withdrawal";
import { WalletRepository, WithdrawalRepository } from "../domain/WalletRepository";
import { WalletMapper, WithdrawalDTO } from "./WalletMapper";

export interface RequestWithdrawalInput {
  artistId: string;
  artistName: string;
  amount: number;
  currency: string;
  method: "pix" | "bank_transfer" | "paypal" | "wise";
}

/**
 * Solicita uma retirada: debita a wallet (regra de domínio) e cria um Withdrawal pendente.
 */
export class RequestWithdrawalUseCase
  implements UseCase<RequestWithdrawalInput, WithdrawalDTO> {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly withdrawalRepo: WithdrawalRepository,
  ) {}

  async execute(input: RequestWithdrawalInput): Promise<WithdrawalDTO> {
    const wallet = await this.walletRepo.findByArtistId(input.artistId);
    if (!wallet) throw new Error("Wallet não encontrada");

    const amount = new Money(input.amount, input.currency);
    wallet.debit(amount);
    await this.walletRepo.save(wallet);

    const withdrawal = Withdrawal.create({
      artistId: input.artistId,
      artistName: input.artistName,
      amount,
      method: input.method,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });
    await this.withdrawalRepo.save(withdrawal);

    return WalletMapper.withdrawalToDTO(withdrawal);
  }
}
