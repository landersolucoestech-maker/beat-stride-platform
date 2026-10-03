import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { artistIdentityGateway } from "./artist.gateway";

const artistIdentitiesKey = ["artist-identities"] as const;

export function useArtistIdentities() {
  return useQuery({
    queryKey: artistIdentitiesKey,
    queryFn: () => artistIdentityGateway.list(),
    staleTime: 30_000,
  });
}

export function useCreateArtistIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { canonicalName: string; kind: "PERSON" | "DUO" | "GROUP" | "PROJECT" }) => artistIdentityGateway.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: artistIdentitiesKey });
    },
  });
}
