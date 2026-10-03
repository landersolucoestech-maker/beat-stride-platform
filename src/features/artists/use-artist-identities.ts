import { useQuery } from "@tanstack/react-query";

import { artistIdentityGateway } from "./artist.gateway";

export function useArtistIdentities() {
  return useQuery({
    queryKey: ["artist-identities"],
    queryFn: () => artistIdentityGateway.list(),
    staleTime: 30_000,
  });
}
