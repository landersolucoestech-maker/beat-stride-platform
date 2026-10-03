import { defineMcp } from "@lovable.dev/mcp-js";
import listArtists from "./tools/list_artists";
import listReleases from "./tools/list_releases";
import listDeliveries from "./tools/list_deliveries";
import listRoyalties from "./tools/list_royalties";
import listSmartLinks from "./tools/list_smart_links";
import listFraudAlerts from "./tools/list_fraud_alerts";
import getWallet from "./tools/get_wallet";

export default defineMcp({
  name: "remix-of-harmony-hub",
  title: "Remix of Harmony Hub",
  version: "0.1.0",
  instructions:
    "Ferramentas somente leitura da plataforma de distribuição musical (dados de demonstração): artistas, lançamentos, entregas, royalties, smart links, alertas de fraude e carteira.",
  tools: [listArtists, listReleases, listDeliveries, listRoyalties, listSmartLinks, listFraudAlerts, getWallet],
});
