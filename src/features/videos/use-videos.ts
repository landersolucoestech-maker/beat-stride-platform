import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { videosGateway } from "./videos.gateway";
import type { CreateVideoDraftInput } from "./videos.types";

export function useVideos() {
  return useQuery({
    queryKey: ["videos", "list"],
    queryFn: () => videosGateway.list(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useVideoReferenceData() {
  return useQuery({
    queryKey: ["videos", "reference-data"],
    queryFn: () => videosGateway.getReferenceData(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCreateVideoDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVideoDraftInput) => videosGateway.createDraft(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos", "list"] });
    },
  });
}
