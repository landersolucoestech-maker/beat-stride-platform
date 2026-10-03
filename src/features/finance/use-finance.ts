import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { financeGateway } from "./finance.gateway";

export function useFinanceOverview() {
  return useQuery({
    queryKey: ["finance", "overview"],
    queryFn: () => financeGateway.getOverview(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: string; currency: string; payoutAccountId: string }) => financeGateway.requestPayout(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance", "overview"] });
    },
  });
}

export function useRoyalties(filters: { period?: string; providerCode?: string }) {
  return useQuery({
    queryKey: ["finance", "royalties", filters.period ?? null, filters.providerCode ?? null],
    queryFn: () => financeGateway.listRoyalties(filters),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useFinancialAnalytics(period?: string) {
  return useQuery({
    queryKey: ["finance", "analytics", period ?? null],
    queryFn: () => financeGateway.getAnalytics(period),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useStatementImportOptions() {
  return useQuery({
    queryKey: ["finance", "statement-import-options"],
    queryFn: () => financeGateway.getStatementImportOptions(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useImportStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { providerCode: string; file: File }) => financeGateway.importStatement(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["finance", "royalties"] }),
        queryClient.invalidateQueries({ queryKey: ["finance", "analytics"] }),
      ]);
    },
  });
}
