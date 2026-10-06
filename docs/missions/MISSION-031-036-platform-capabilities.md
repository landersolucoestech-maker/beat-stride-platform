# MISSION-031 through MISSION-036 — Platform Capability Foundations

Status: Foundation Implemented

## MISSION-031 Content ID / UGC
Content ID and UGC protection remain distinct from catalog ownership and distribution delivery. Recording enrollment requires authority context. Allowlisting is explicit, platform-scoped, revocable, and auditable. Provider claim events are treated as external observations and must not silently mutate authority.

## MISSION-032 Marketing
Native Distribution marketing owns release-centric capabilities such as smart links, pre-save, DSP pitching, promotion workflows, playlist tracking, and marketing content tied to a release. Marketing content may include audiovisual and promotional assets such as teasers, trailers, music videos, visualizers, lyric videos, short-form vertical videos, stories, behind-the-scenes material, artwork, and audio snippets. Planning, scheduling, and provider-authorized publication remain release-centric and must not become a general CRM or general-purpose social-media management suite.

### Publication channels and promotional assets
Meta (Instagram/Facebook), TikTok, and YouTube/YouTube Shorts connections are configured under Settings > Integrations and are consumed as Marketing capabilities. Planning remains possible while a channel is disconnected; automated execution is gated by connection state, provider configuration, publication eligibility, and asset readiness.

Promotional campaign assets are distinct classifications from distribution masters. Marketing image, video, and audio assets may reference release context without becoming delivery masters. External object storage is accessed only behind an asset-storage provider contract. The application must not simulate successful byte upload when storage is unavailable, and credential secrets/tokens must be stored through secure secret references rather than plaintext business records.

Provider publication is a critical asynchronous side effect and must use provider adapters plus the Transactional Outbox when execution is enabled.

### Creators Integration boundary
Account connection is managed in Settings > Integrations. Lander Creators is not a standalone Marketing navigation module. When the connection is active, Creators is exposed as an optional capability inside the Start Marketing flow for the selected release.

Distribution owns the integration experience only. Lander Creators remains source of truth for creators, campaigns, deliverables, orders, payments, and campaign performance. Distribution stores account connection state, explicit organization mapping, external references, synchronization checkpoints, checkout references, and authorized read projections.

Credentials are delegated and revocable. Distribution never stores a Lander Creators password. Browser checkout return is UX only; payment and campaign activation require authenticated server-to-server confirmation. A Creators outage must not block catalog, QC, delivery, royalties, accounting, or payouts.

## MISSION-033 Risk / Fraud
Risk is a first-class case domain. Signals do not automatically become final adverse decisions. High-impact actions require explicit policy, evidence, audit, and human review where required.

## MISSION-034 Support
Support tickets are organization-scoped and remain separate from operational work items. Support does not bypass domain authorization.

## MISSION-035 Backoffice Operations
Backoffice uses the same business core as the portal and Partner API. Operational work items support typed queues, assignment, evidence, and auditable completion. Backoffice overrides must be explicit and cannot become arbitrary database writes.

## MISSION-036 AI / Automation
AI is accessed behind a provider abstraction and is not a source of truth for rights, authority, financial posting, permanent enforcement, destructive catalog operations, or other critical decisions. Automation runs declare autonomy mode: AUTO, CONTROLLED, or APPROVAL_GATED. Tool invocations are logged with reversibility metadata and correlation context.
