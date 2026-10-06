import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { marketingChannelIntegrationsGateway } from "./marketing-channel-integrations.gateway";
import type { MarketingChannelProvider } from "./marketing-channel-integrations.types";

export function useMarketingChannelIntegrations() {
  return useQuery({
    queryKey: ["integrations", "marketing-channels"],
    queryFn: () => marketingChannelIntegrationsGateway.getOverview(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useBeginMarketingChannelAuthorization() {
  return useMutation({
    mutationFn: (provider: MarketingChannelProvider) =>
      marketingChannelIntegrationsGateway.beginAuthorization(provider),
  });
}

export function useDisconnectMarketingChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: MarketingChannelProvider) =>
      marketingChannelIntegrationsGateway.disconnect(provider),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["integrations", "marketing-channels"] });
    },
  });
}
