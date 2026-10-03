import { useQuery } from "@tanstack/react-query";

import { catalogGateway } from "./catalog.gateway";

export function useCatalogReleases() {
  return useQuery({
    queryKey: ["catalog", "releases"],
    queryFn: () => catalogGateway.listReleases(),
    staleTime: 30_000,
    retry: 1,
  });
}
