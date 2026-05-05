import { InMemoryArtistRepository } from "@/core/catalog/infra/InMemoryArtistRepository";
import { InMemoryReleaseRepository } from "@/core/catalog/infra/InMemoryReleaseRepository";
import { InMemoryDeliveryRepository } from "@/core/distribution/infra/InMemoryDeliveryRepository";
import { InMemoryRoyaltyRepository } from "@/core/royalties/infra/InMemoryRoyaltyRepository";
import { InMemoryWalletRepository, InMemoryWithdrawalRepository } from "@/core/wallet/infra/InMemoryWalletRepository";
import { InMemorySmartLinkRepository } from "@/core/smartlinks/infra/InMemorySmartLinkRepository";
import { InMemoryFraudRepository } from "@/core/fraud/infra/InMemoryFraudRepository";

import { ListArtistsUseCase } from "@/core/catalog/application/ListArtistsUseCase";
import { ListReleasesUseCase } from "@/core/catalog/application/ListReleasesUseCase";
import { ListDeliveriesUseCase } from "@/core/distribution/application/ListDeliveriesUseCase";
import { ListRoyaltiesUseCase } from "@/core/royalties/application/ListRoyaltiesUseCase";
import { ImportRoyaltyReportUseCase } from "@/core/royalties/application/ImportRoyaltyReportUseCase";
import { GetWalletUseCase, ListWithdrawalsUseCase } from "@/core/wallet/application/GetWalletUseCase";
import { RequestWithdrawalUseCase } from "@/core/wallet/application/RequestWithdrawalUseCase";
import { ListSmartLinksUseCase } from "@/core/smartlinks/application/ListSmartLinksUseCase";
import { ListFraudAlertsUseCase } from "@/core/fraud/application/ListFraudAlertsUseCase";

import {
  seedArtists, seedReleases, seedDeliveries, seedRoyalties,
  seedWallets, seedWithdrawals, seedSmartLinks, seedFraudAlerts,
} from "./seed";

/**
 * Composition Root: instancia repositórios in-memory, popula seeds
 * e expõe os use cases. Substituível por adapters reais sem alterar UI.
 */
function buildContainer() {
  const artistRepo = new InMemoryArtistRepository();
  const releaseRepo = new InMemoryReleaseRepository();
  const deliveryRepo = new InMemoryDeliveryRepository();
  const royaltyRepo = new InMemoryRoyaltyRepository();
  const walletRepo = new InMemoryWalletRepository();
  const withdrawalRepo = new InMemoryWithdrawalRepository();
  const smartLinkRepo = new InMemorySmartLinkRepository();
  const fraudRepo = new InMemoryFraudRepository();

  // Seeds
  seedArtists.forEach(a => artistRepo.save(a));
  seedReleases.forEach(r => releaseRepo.save(r));
  seedDeliveries.forEach(d => deliveryRepo.save(d));
  royaltyRepo.saveBatch(seedRoyalties);
  seedWallets.forEach(w => walletRepo.save(w));
  seedWithdrawals.forEach(w => withdrawalRepo.save(w));
  seedSmartLinks.forEach(s => smartLinkRepo.save(s));
  seedFraudAlerts.forEach(a => fraudRepo.save(a));

  return {
    repos: { artistRepo, releaseRepo, deliveryRepo, royaltyRepo, walletRepo, withdrawalRepo, smartLinkRepo, fraudRepo },
    useCases: {
      listArtists: new ListArtistsUseCase(artistRepo),
      listReleases: new ListReleasesUseCase(releaseRepo),
      listDeliveries: new ListDeliveriesUseCase(deliveryRepo),
      listRoyalties: new ListRoyaltiesUseCase(royaltyRepo),
      importRoyalties: new ImportRoyaltyReportUseCase(royaltyRepo),
      getWallet: new GetWalletUseCase(walletRepo),
      listWithdrawals: new ListWithdrawalsUseCase(withdrawalRepo),
      requestWithdrawal: new RequestWithdrawalUseCase(walletRepo, withdrawalRepo),
      listSmartLinks: new ListSmartLinksUseCase(smartLinkRepo),
      listFraudAlerts: new ListFraudAlertsUseCase(fraudRepo),
    },
  };
}

export const container = buildContainer();
export type Container = typeof container;
