import { useQuery } from "@tanstack/react-query";

import { rightsProtectionGateway } from "./rights-protection.gateway";

export function useRightsProtection() {
  return useQuery({
    queryKey: ["rights-protection"],
    queryFn: () => rightsProtectionGateway.list(),
    staleTime: 30_000,
  });
}
