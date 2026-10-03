import { useQuery } from "@tanstack/react-query";

import { sessionGateway } from "./session.gateway";

export function useSessionContext() {
  return useQuery({
    queryKey: ["session", "context"],
    queryFn: () => sessionGateway.getContext(),
    staleTime: 30_000,
    retry: 1,
  });
}
