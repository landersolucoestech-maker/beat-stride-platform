export type ProviderCapability =
  | "DELIVERY"
  | "TAKEDOWN"
  | "UPDATE"
  | "UGC"
  | "CONTENT_ID"
  | "ALLOWLIST"
  | "CLAIM_RELEASE"
  | "ANALYTICS"
  | "ROYALTIES"
  | "PAYOUTS"
  | "RIGHTS"
  | "TERRITORIES";

export type ProviderHealth = "HEALTHY" | "DEGRADED" | "UNAVAILABLE" | "UNKNOWN";
