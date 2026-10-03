import { useMutation, useQuery } from "@tanstack/react-query";

import { releaseEditorGateway } from "./release-editor.gateway";
import type { CreateReleaseDraftInput } from "./release-editor.types";

export function useReleaseEditorReferenceData() {
  return useQuery({
    queryKey: ["release-editor", "reference-data"],
    queryFn: () => releaseEditorGateway.getReferenceData(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCreateReleaseDraft() {
  return useMutation({
    mutationFn: (input: CreateReleaseDraftInput) => releaseEditorGateway.createDraft(input),
  });
}
