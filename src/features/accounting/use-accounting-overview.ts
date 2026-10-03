import { useQuery } from "@tanstack/react-query";

import { accountingGateway } from "./accounting.gateway";

export function useAccountingOverview() {
  return useQuery({
    queryKey: ["accounting", "overview"],
    queryFn: () => accountingGateway.getOverview(),
    staleTime: 30_000,
    retry: 1,
  });
}
