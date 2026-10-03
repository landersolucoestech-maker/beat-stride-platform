import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { catalogGateway } from "./catalog.gateway";

export function useCatalogRelease(releaseId: string) {
  return useQuery({
    queryKey: ["catalog", "release", releaseId],
    queryFn: () => catalogGateway.getRelease(releaseId),
    enabled: releaseId.length > 0,
    staleTime: 15_000,
  });
}

export function useReleaseReadiness(releaseId: string) {
  return useQuery({
    queryKey: ["catalog", "release", releaseId, "readiness"],
    queryFn: () => catalogGateway.getReadiness(releaseId),
    enabled: releaseId.length > 0,
    staleTime: 10_000,
  });
}

export function useSubmitRelease(releaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expectedVersion: number) => catalogGateway.submit(releaseId, expectedVersion),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["catalog", "release", releaseId] }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "release", releaseId, "readiness"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "releases"] }),
      ]);
    },
  });
}
