import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { marketingGateway } from "./marketing.gateway";
import type {
  MarketingCampaignType,
  MarketingContentType,
  MarketingPublicationChannel,
} from "./marketing.types";

export function useMarketingOverview() {
  return useQuery({
    queryKey: ["marketing", "overview"],
    queryFn: () => marketingGateway.getOverview(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMarketingCampaigns(releaseId?: string) {
  return useQuery({
    queryKey: ["marketing", "campaigns", releaseId ?? "all"],
    queryFn: () => marketingGateway.listCampaigns(releaseId),
    staleTime: 15_000,
    retry: 1,
  });
}

export function useCreateMarketingCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      releaseId: string;
      campaignType: MarketingCampaignType;
      startsAt?: string | null;
      endsAt?: string | null;
    }) => marketingGateway.createCampaign(input),
    onSuccess: async (campaign) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaign.releaseId] }),
      ]);
    },
  });
}

export function useCampaignContents(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["marketing", "campaigns", campaignId, "contents"],
    queryFn: () => marketingGateway.getCampaignContents(campaignId!),
    enabled: Boolean(campaignId),
    staleTime: 10_000,
    retry: 1,
  });
}

export function useCreateCampaignContent(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      recordingId?: string | null;
      assetId?: string | null;
      contentType: MarketingContentType;
      title: string;
      notes?: string | null;
    }) => marketingGateway.createCampaignContent(campaignId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaignId, "contents"] });
    },
  });
}

export function useRegisterContentAsset(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      contentId: string;
      fileName: string;
      contentType: string;
      byteSize: number;
    }) => marketingGateway.registerContentAsset(input.contentId, {
      fileName: input.fileName,
      contentType: input.contentType,
      byteSize: input.byteSize,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaignId, "contents"] });
    },
  });
}

export function useCreatePublicationPlan(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      contentId: string;
      channel: MarketingPublicationChannel;
      scheduledFor?: string | null;
    }) => marketingGateway.createPublicationPlan(input.contentId, {
      channel: input.channel,
      scheduledFor: input.scheduledFor,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaignId, "contents"] });
    },
  });
}

export function useMarketingSmartLinks() {
  return useQuery({
    queryKey: ["marketing", "smart-links"],
    queryFn: () => marketingGateway.getSmartLinks(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useFanListOverview() {
  return useQuery({
    queryKey: ["marketing", "fans"],
    queryFn: () => marketingGateway.getFanList(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMarketingTools() {
  return useQuery({
    queryKey: ["marketing", "tools"],
    queryFn: () => marketingGateway.getTools(),
    staleTime: 60_000,
    retry: 1,
  });
}
