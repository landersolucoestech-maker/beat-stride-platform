import { useQuery } from "@tanstack/react-query";
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

export default function PublicSmartLink() {
  const { linkId, slug } = useParams<{ linkId: string; slug: string }>();

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
              <a href={destination.url} target="_blank" rel="noreferrer">
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
