export type ArtistIdentityStatus = "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "DISPUTED" | "INACTIVE";
export type RepresentationSummaryStatus = "NONE" | "PENDING" | "ACTIVE" | "DISPUTED" | "TERMINATED";

export interface ArtistIdentityListItem {
  id: string;
  displayName: string;
  status: ArtistIdentityStatus;
  representationStatus: RepresentationSummaryStatus;
  authorityVerified: boolean;
  imageUrl: string | null;
}

export interface ArtistIdentityListResult {
  items: ArtistIdentityListItem[];
  available: boolean;
}
