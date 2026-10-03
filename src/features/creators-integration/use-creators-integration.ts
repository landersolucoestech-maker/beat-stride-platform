import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { creatorsIntegrationGateway } from "./creators-integration.gateway";

export function useCreatorsIntegrationOverview() {
  return useQuery({
    queryKey: ["integrations", "creators"],
    queryFn: () => creatorsIntegrationGateway.getOverview(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useDisconnectCreatorsIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => creatorsIntegrationGateway.disconnect(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["integrations", "creators"] });
    },
  });
}
