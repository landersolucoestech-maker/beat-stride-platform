import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Money } from "@/core/shared/domain/Money";
import { Wallet } from "../domain/Wallet";
import { PayoutMethod, Withdrawal, WithdrawalStatus } from "../domain/Withdrawal";

export interface WalletDTO {
  id: string;
  artistId: string;
  available: number;
  pending: number;
  lifetimeEarnings: number;
  currency: string;
}

export interface WithdrawalDTO {
  id: string;
  artistId: string;
  artistName: string;
  amount: number;
  currency: string;
  method: PayoutMethod;
  status: WithdrawalStatus;
  requestedAt: string;
  completedAt?: string;
}

export class WalletMapper {
  static walletToDTO(w: Wallet): WalletDTO {
    return {
      id: w.id.toString(),
      artistId: w.artistId,
      available: w.available.amount,
      pending: w.pending.amount,
      lifetimeEarnings: w.lifetimeEarnings.amount,
      currency: w.available.currency,
    };
  }

  static walletToDomain(dto: WalletDTO): Wallet {
    return Wallet.create(
      {
        artistId: dto.artistId,
        available: new Money(dto.available, dto.currency),
        pending: new Money(dto.pending, dto.currency),
        lifetimeEarnings: new Money(dto.lifetimeEarnings, dto.currency),
      },
      new UniqueId(dto.id),
    );
  }

  static withdrawalToDTO(w: Withdrawal): WithdrawalDTO {
    return {
      id: w.id.toString(),
      artistId: w.artistId,
      artistName: w.artistName,
      amount: w.amount.amount,
      currency: w.amount.currency,
      method: w.method,
      status: w.status,
      requestedAt: w.requestedAt,
      completedAt: w.completedAt,
    };
  }

  static withdrawalToDomain(dto: WithdrawalDTO): Withdrawal {
    return Withdrawal.create(
      {
        artistId: dto.artistId,
        artistName: dto.artistName,
        amount: new Money(dto.amount, dto.currency),
        method: dto.method,
        status: dto.status,
        requestedAt: dto.requestedAt,
        completedAt: dto.completedAt,
      },
      new UniqueId(dto.id),
    );
  }
}
