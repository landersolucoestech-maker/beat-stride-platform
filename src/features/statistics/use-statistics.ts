import { useQuery } from "@tanstack/react-query";

import { statisticsGateway } from "./statistics.gateway";

export function useDemographics() { return useQuery({ queryKey: ["statistics", "demographics"], queryFn: () => statisticsGateway.getDemographics(), staleTime: 30_000, retry: 1 }); }
export function useTikTokStatistics() { return useQuery({ queryKey: ["statistics", "tiktok"], queryFn: () => statisticsGateway.getTikTok(), staleTime: 30_000, retry: 1 }); }
export function useStoreComparison() { return useQuery({ queryKey: ["statistics", "stores"], queryFn: () => statisticsGateway.getStores(), staleTime: 30_000, retry: 1 }); }
export function useMusicCharts() { return useQuery({ queryKey: ["statistics", "charts"], queryFn: () => statisticsGateway.getCharts(), staleTime: 30_000, retry: 1 }); }
export function useTrackers() { return useQuery({ queryKey: ["statistics", "trackers"], queryFn: () => statisticsGateway.getTrackers(), staleTime: 30_000, retry: 1 }); }
