import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ExternalLink, Headphones, Link as LinkIcon } from "lucide-react";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

interface PublicSmartLinkView {
  id: string;
  title: string;
  slug: string;
  linkType: "SMART_LINK" | "PRE_SAVE";
  releaseTitle: string;
  artistName: string;
  releaseDate: string | null;
  destinations: Array<{ code: string; url: string }>;
}

type PublicMarketingEventType = "PAGE_VIEW" | "DESTINATION_CLICK";

function getAnonymousSessionId(): string {
  const key = "lander.marketing-link-session";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;

  const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  window.sessionStorage.setItem(key, created);
  return created;
}

function getReferrerOrigin(): string | null {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).origin;
  } catch {
    return null;
  }
}

async function trackPublicEvent(input: {
  linkId: string;
  slug: string;
  eventType: PublicMarketingEventType;
  destinationCode?: string;
}): Promise<void> {
  const params = new URLSearchParams(window.location.search);

  await apiRequest(
    `/api/v1/public/marketing-links/${input.linkId}/${input.slug}/events`,
    {
      method: "POST",
      keepalive: true,
      body: JSON.stringify({
        eventType: input.eventType,
        destinationCode: input.destinationCode ?? null,
        anonymousSessionId: getAnonymousSessionId(),
        referrer: getReferrerOrigin(),
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      }),
    },
    { organizationScoped: false },
  );
}

export default function PublicSmartLink() {
  const { linkId, slug } = useParams<{ linkId: string; slug: string }>();
  const pageViewTracked = useRef(false);

  const query = useQuery({
    queryKey: ["public", "marketing-link", linkId, slug],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/v1/public/marketing-links/${linkId}/${slug}`,
        {},
        { organizationScoped: false },
      );
      return (await response.json()) as PublicSmartLinkView;
    },
    enabled: Boolean(linkId && slug),
    retry: false,
  });

  useEffect(() => {
    if (!query.data || !linkId || !slug || pageViewTracked.current) return;
    pageViewTracked.current = true;

    void trackPublicEvent({
      linkId,
      slug,
      eventType: "PAGE_VIEW",
    }).catch(() => {
      // Tracking must never block or break the public landing page.
    });
  }, [linkId, query.data, slug]);

  if (query.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-muted-foreground">
        Carregando lançamento...
      </main>
    );
  }

  if (query.isError || !query.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <LinkIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Link indisponível</h1>
          <p className="mt-2 text-muted-foreground">
            Este Smart Link não existe, não está ativo ou foi removido.
          </p>
        </div>
      </main>
    );
  }

  const link = query.data;

  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-muted">
          <Headphones className="h-10 w-10 text-primary" />
        </div>

        <Badge variant="secondary" className="mt-6">
          {link.linkType === "PRE_SAVE" ? "Pré-save" : "Smart Link"}
        </Badge>

        <h1 className="mt-4 text-center text-3xl font-bold tracking-tight text-foreground">
          {link.releaseTitle}
        </h1>

        {link.artistName && (
          <p className="mt-2 text-center text-base text-muted-foreground">{link.artistName}</p>
        )}

        {link.releaseDate && (
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Lançamento:{" "}
            {new Date(`${link.releaseDate}T00:00:00Z`).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })}
          </p>
        )}

        <div className="mt-8 w-full space-y-3">
          {link.destinations.map((destination) => (
            <Button
              key={destination.code}
              asChild
              size="lg"
              variant="outline"
              className="h-14 w-full justify-between px-5"
            >
              <a
                href={destination.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (!linkId || !slug) return;
                  void trackPublicEvent({
                    linkId,
                    slug,
                    eventType: "DESTINATION_CLICK",
                    destinationCode: destination.code,
                  }).catch(() => {
                    // Navigation remains available even if tracking fails.
                  });
                }}
              >
                <span>{destination.code.replace(/_/g, " ")}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ))}
        </div>

        {link.linkType === "PRE_SAVE" && (
          <div className="mt-6 w-full rounded-xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            Os botões disponíveis nesta página direcionam aos destinos configurados. Confirmação automática de pré-save será exibida somente quando houver integração autorizada com o respectivo DSP.
          </div>
        )}

        <p className="mt-10 text-xs text-muted-foreground">Powered by Lander</p>
      </div>
    </main>
  );
}
