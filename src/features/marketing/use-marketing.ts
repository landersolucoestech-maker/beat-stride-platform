import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { marketingGateway } from "./marketing.gateway";
import type {
  CreateSmartLinkInput,
  MarketingCampaignPhase,
  MarketingCampaignTaskCategory,
  MarketingCampaignTaskStatus,
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
      name?: string;
      objective?: string | null;
      focusRecordingId?: string | null;
      brief?: string | null;
      budgetMinor?: number | null;
      budgetCurrency?: string | null;
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

export function useCampaignTasks(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["marketing", "campaigns", campaignId, "tasks"],
    queryFn: () => marketingGateway.getCampaignTasks(campaignId!),
    enabled: Boolean(campaignId),
    staleTime: 10_000,
    retry: 1,
  });
}

export function useCreateCampaignTask(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      phase: MarketingCampaignPhase;
      category: MarketingCampaignTaskCategory;
      title: string;
      description?: string | null;
      assigneeUserId?: string | null;
      dueAt?: string | null;
      sortOrder?: number;
    }) => marketingGateway.createCampaignTask(campaignId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaignId, "tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaignId, "calendar"] }),
      ]);
    },
  });
}

export function useUpdateCampaignTaskStatus(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { taskId: string; status: MarketingCampaignTaskStatus }) =>
      marketingGateway.updateCampaignTaskStatus(input.taskId, input.status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaignId, "tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["marketing", "campaigns", campaignId, "calendar"] }),
      ]);
    },
  });
}

export function useCampaignCalendar(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["marketing", "campaigns", campaignId, "calendar"],
    queryFn: () => marketingGateway.getCampaignCalendar(campaignId!),
    enabled: Boolean(campaignId),
    staleTime: 10_000,
    retry: 1,
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

export function useCreateSmartLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSmartLinkInput) => marketingGateway.createSmartLink(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["marketing", "smart-links"] });
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
