import { useQuery } from "@tanstack/react-query";

import { splitsGateway } from "./splits.gateway";

export function useSplitOverview() {
  return useQuery({
    queryKey: ["splits", "overview"],
    queryFn: () => splitsGateway.getOverview(),
    staleTime: 30_000,
    retry: 1,
  });
}
