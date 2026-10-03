import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supportGateway } from "./support.gateway";
import type { SupportPriority } from "./support.types";

export function useSupportTickets() {
  return useQuery({
    queryKey: ["support", "tickets"],
    queryFn: () => supportGateway.listTickets(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { subject: string; description: string; priority: SupportPriority }) => supportGateway.createTicket(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
}

export function useSupportKnowledgeBase() {
  return useQuery({
    queryKey: ["support", "knowledge-base"],
    queryFn: () => supportGateway.getKnowledgeBase(),
    staleTime: 60_000,
    retry: 1,
  });
}
