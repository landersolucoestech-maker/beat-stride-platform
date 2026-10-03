import { useQuery } from "@tanstack/react-query";

import { contentIdGateway } from "./content-id.gateway";

export function useContentIdOverview() {
  return useQuery({
    queryKey: ["content-id", "overview"],
    queryFn: () => contentIdGateway.getOverview(),
    staleTime: 30_000,
  });
}
