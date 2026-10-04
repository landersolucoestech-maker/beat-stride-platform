import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

interface MarketingReleaseRow extends QueryResultRow {
  id: string;
  title: string;
  artist_name: string | null;
  release_date: string | null;
}

interface SmartLinkRow extends QueryResultRow {
  id: string;
  title: string;
  slug: string;
  destinations: Array<{ code: string; label: string }> | null;
}

@Injectable()
export class MarketingService {
  constructor(private readonly database: DatabaseService) {}

  async getOverview(organizationId: string) {
    const releases = await this.database.query<MarketingReleaseRow>(
      `SELECT
         release.id,
         release.title,
         primary_artist.canonical_name AS artist_name,
         metadata.release_date::text AS release_date
       FROM releases release
       LEFT JOIN release_metadata_versions metadata
         ON metadata.release_id = release.id
        AND metadata.release_version = release.current_version
       LEFT JOIN LATERAL (
         SELECT artist.canonical_name
         FROM release_artist_credits credit
         JOIN artist_identities artist ON artist.id = credit.artist_identity_id
         WHERE credit.release_id = release.id
           AND credit.credit_role = 'PRIMARY'
         ORDER BY credit.display_order ASC
         LIMIT 1
       ) primary_artist ON TRUE
       WHERE release.organization_id = $1
       ORDER BY release.updated_at DESC, release.id DESC
       LIMIT 200`,
      [organizationId],
    );

    return {
      available: true,
      releases: releases.rows.map((row) => ({
        id: row.id,
        title: row.title,
        artistName: row.artist_name ?? "",
        releaseDate: row.release_date,
      })),
      actions: [
        { code: "PRE_SAVE", label: "Pré-save", description: "Prepare uma ação de pré-save vinculada ao lançamento.", enabled: false },
        { code: "DSP_PITCH", label: "Pitch para DSPs", description: "Organize o contexto editorial do lançamento para pitch.", enabled: false },
        { code: "PROMOTION", label: "Promoção", description: "Estruture uma ação promocional vinculada ao catálogo.", enabled: false },
        { code: "PLAYLIST_TRACKING", label: "Monitoramento de playlists", description: "Acompanhe sinais de playlists quando a fonte de dados estiver conectada.", enabled: false },
      ],
    };
  }

  async getSmartLinks(organizationId: string) {
    const result = await this.database.query<SmartLinkRow>(
      `SELECT
         smart_link.id,
         smart_link.title,
         smart_link.slug,
         COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'code', destination.destination_code,
               'label', destination.destination_code
             ) ORDER BY destination.position ASC
           ) FILTER (WHERE destination.id IS NOT NULL),
           '[]'::jsonb
         ) AS destinations
       FROM marketing_smart_links smart_link
       LEFT JOIN marketing_smart_link_destinations destination ON destination.smart_link_id = smart_link.id
       WHERE smart_link.organization_id = $1
         AND smart_link.status <> 'ARCHIVED'
       GROUP BY smart_link.id, smart_link.title, smart_link.slug, smart_link.updated_at
       ORDER BY smart_link.updated_at DESC, smart_link.id DESC`,
      [organizationId],
    );

    return {
      available: true,
      items: result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        artworkUrl: null,
        publicUrl: null,
        destinations: row.destinations ?? [],
        visits: null,
        conversions: null,
        conversionRate: null,
      })),
    };
  }

  getFanList() {
    return {
      available: false,
      summary: { totalContacts: null, subscribedContacts: null, unsubscribedContacts: null, lastUpdatedAt: null },
      sources: [],
    };
  }

  getTools() {
    return { available: false, items: [] };
  }
}
