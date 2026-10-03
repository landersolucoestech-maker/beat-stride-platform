import { useQuery } from "@tanstack/react-query";

import { marketingGateway } from "./marketing.gateway";

export function useMarketingOverview() { return useQuery({ queryKey: ["marketing", "overview"], queryFn: () => marketingGateway.getOverview(), staleTime: 30_000, retry: 1 }); }
export function useMarketingSmartLinks() { return useQuery({ queryKey: ["marketing", "smart-links"], queryFn: () => marketingGateway.getSmartLinks(), staleTime: 30_000, retry: 1 }); }
export function useFanListOverview() { return useQuery({ queryKey: ["marketing", "fans"], queryFn: () => marketingGateway.getFanList(), staleTime: 30_000, retry: 1 }); }
export function useMarketingTools() { return useQuery({ queryKey: ["marketing", "tools"], queryFn: () => marketingGateway.getTools(), staleTime: 60_000, retry: 1 }); }
