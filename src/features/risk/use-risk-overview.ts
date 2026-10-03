import { useQuery } from "@tanstack/react-query";

import { riskGateway } from "./risk.gateway";

export function useRiskOverview() {
  return useQuery({
    queryKey: ["risk", "overview"],
    queryFn: () => riskGateway.getOverview(),
    staleTime: 30_000,
    retry: 1,
  });
}
