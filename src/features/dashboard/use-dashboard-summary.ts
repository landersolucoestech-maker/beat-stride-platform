import { useQuery } from "@tanstack/react-query";

import { dashboardGateway } from "./dashboard.gateway";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardGateway.getSummary(),
    staleTime: 30_000,
  });
}
