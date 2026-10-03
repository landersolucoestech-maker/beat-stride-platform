import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { settingsGateway } from "./settings.gateway";

export function useProfileSettings() {
  return useQuery({ queryKey: ["settings", "profile"], queryFn: () => settingsGateway.getProfile(), staleTime: 30_000, retry: 1 });
}

export function useUpdateProfileSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { displayName: string; phone: string | null; preferredCurrency: string | null }) => settingsGateway.updateProfile(input),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["settings", "profile"] }); },
  });
}

export function useSecuritySettings() {
  return useQuery({ queryKey: ["settings", "security"], queryFn: () => settingsGateway.getSecurity(), staleTime: 30_000, retry: 1 });
}
