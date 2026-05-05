import { useEffect, useState } from "react";
import { container } from "@/core/container";
import { ArtistDTO, ReleaseDTO } from "@/core/catalog/application/CatalogMapper";
import { DeliveryDTO } from "@/core/distribution/application/DistributionMapper";
import { RoyaltyLineDTO } from "@/core/royalties/application/RoyaltyMapper";
import { WalletDTO, WithdrawalDTO } from "@/core/wallet/application/WalletMapper";
import { SmartLinkDTO } from "@/core/smartlinks/application/SmartLinkMapper";
import { FraudAlertDTO } from "@/core/fraud/application/FraudMapper";

function useUseCase<T>(loader: () => Promise<T> | T, deps: unknown[] = []): { data: T | null; reload: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    Promise.resolve(loader()).then(setData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, reload: () => setTick(t => t + 1) };
}

export function useArtists() {
  return useUseCase<ArtistDTO[]>(() => container.useCases.listArtists.execute());
}
export function useReleases() {
  return useUseCase<ReleaseDTO[]>(() => container.useCases.listReleases.execute());
}
export function useDeliveries() {
  return useUseCase<DeliveryDTO[]>(() => container.useCases.listDeliveries.execute());
}
export function useRoyalties() {
  return useUseCase<RoyaltyLineDTO[]>(() => container.useCases.listRoyalties.execute());
}
export function useWallet(artistId: string) {
  return useUseCase<WalletDTO | null>(() => container.useCases.getWallet.execute(artistId), [artistId]);
}
export function useWithdrawals() {
  return useUseCase<WithdrawalDTO[]>(() => container.useCases.listWithdrawals.execute());
}
export function useSmartLinks() {
  return useUseCase<SmartLinkDTO[]>(() => container.useCases.listSmartLinks.execute());
}
export function useFraudAlerts() {
  return useUseCase<FraudAlertDTO[]>(() => container.useCases.listFraudAlerts.execute());
}
