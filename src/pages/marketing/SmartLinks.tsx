import { useState } from "react";
import { BarChart3, Copy, ExternalLink, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreateSmartLink,
  useMarketingOverview,
  useMarketingSmartLinks,
} from "@/features/marketing/use-marketing";
import type { SmartLinkType } from "@/features/marketing/marketing.types";
import { formatDecimalPtBr } from "@/lib/format-money";

type DestinationDraft = {
  code: string;
  url: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export default function SmartLinks() {
  const query = useMarketingSmartLinks();
  const overviewQuery = useMarketingOverview();
  const createMutation = useCreateSmartLink();
  const data = query.data;

  const [showForm, setShowForm] = useState(false);
  const [releaseId, setReleaseId] = useState("");
  const [linkType, setLinkType] = useState<SmartLinkType>("SMART_LINK");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [destinations, setDestinations] = useState<DestinationDraft[]>([
    { code: "SPOTIFY", url: "" },
  ]);

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  const updateDestination = (
    index: number,
    field: keyof DestinationDraft,
    value: string,
  ) => {
    setDestinations((current) =>
      current.map((destination, currentIndex) =>
        currentIndex === index
          ? {
              ...destination,
              [field]: field === "code" ? value.toUpperCase().replace(/[^A-Z0-9_]/g, "") : value,
            }
          : destination,
      ),
    );
  };

  const addDestination = () => {
    setDestinations((current) => [...current, { code: "", url: "" }]);
  };

  const removeDestination = (index: number) => {
    setDestinations((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const resetForm = () => {
    setReleaseId("");
    setLinkType("SMART_LINK");
    setTitle("");
    setSlug("");
    setDestinations([{ code: "SPOTIFY", url: "" }]);
    setShowForm(false);
  };

  const submit = async () => {
    const normalizedDestinations = destinations
      .map((destination) => ({
        code: destination.code.trim().toUpperCase(),
        url: destination.url.trim(),
      }))
      .filter((destination) => destination.code && destination.url);

    if (!releaseId || !title.trim() || !slug.trim() || normalizedDestinations.length === 0) {
      toast.error("Preencha release, título, slug e pelo menos um destino.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        releaseId,
        title: title.trim(),
        slug: slugify(slug),
        linkType,
        destinations: normalizedDestinations,
        activate: true,
      });
      toast.success(linkType === "PRE_SAVE" ? "Pré-save criado." : "Smart Link criado.");
      resetForm();
    } catch {
      toast.error("Não foi possível criar o link. Verifique o slug e os destinos.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Links & Pré-save</h1>
            <p className="text-muted-foreground">
              Crie links vinculados ao catálogo e organize os destinos do lançamento.
            </p>
          </div>
          <Button onClick={() => setShowForm((current) => !current)}>
            <LinkIcon className="mr-2 h-4 w-4" />
            {showForm ? "Fechar" : "Criar link"}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Novo Smart Link / Pré-save</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Release</Label>
                  <Select value={releaseId} onValueChange={setReleaseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o lançamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {(overviewQuery.data?.releases ?? []).map((release) => (
                        <SelectItem key={release.id} value={release.id}>
                          {release.title}
                          {release.artistName ? ` — ${release.artistName}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={linkType} onValueChange={(value) => setLinkType(value as SmartLinkType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMART_LINK">Smart Link</SelectItem>
                      <SelectItem value="PRE_SAVE">Pré-save</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smart-link-title">Título</Label>
                  <Input
                    id="smart-link-title"
                    value={title}
                    onChange={(event) => {
                      const nextTitle = event.target.value;
                      setTitle(nextTitle);
                      if (!slug) setSlug(slugify(nextTitle));
                    }}
                    placeholder="Ex.: Meu Novo Single"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smart-link-slug">Slug</Label>
                  <Input
                    id="smart-link-slug"
                    value={slug}
                    onChange={(event) => setSlug(slugify(event.target.value))}
                    placeholder="meu-novo-single"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Destinos</p>
                    <p className="text-xs text-muted-foreground">
                      Informe apenas URLs HTTPS reais do lançamento.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addDestination}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar destino
                  </Button>
                </div>

                <div className="space-y-3">
                  {destinations.map((destination, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                      <Input
                        value={destination.code}
                        onChange={(event) => updateDestination(index, "code", event.target.value)}
                        placeholder="SPOTIFY"
                        aria-label={`Código do destino ${index + 1}`}
                      />
                      <Input
                        type="url"
                        value={destination.url}
                        onChange={(event) => updateDestination(index, "url", event.target.value)}
                        placeholder="https://..."
                        aria-label={`URL do destino ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDestination(index)}
                        disabled={destinations.length === 1}
                        aria-label="Remover destino"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {linkType === "PRE_SAVE" && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Nesta etapa o sistema cria a página de pré-save e seus destinos. Confirmação real de pré-save em DSP só será habilitada quando houver integração OAuth/provedor compatível.
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => void submit()}
                  disabled={
                    createMutation.isPending ||
                    !releaseId ||
                    !title.trim() ||
                    !slug.trim() ||
                    destinations.every((destination) => !destination.code.trim() || !destination.url.trim())
                  }
                >
                  {createMutation.isPending ? "Criando..." : "Criar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!query.isLoading && data?.available === false && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O serviço real de Smart Links ainda não está conectado neste preview. URLs e métricas fictícias foram removidas.
          </div>
        )}

        {query.isLoading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : (data?.items.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <LinkIcon className="mx-auto h-6 w-6 text-muted-foreground" />
            <h3 className="mt-3 text-lg font-medium">Nenhum Smart Link disponível</h3>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((link) => (
              <Card key={link.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-square bg-muted">
                  {link.artworkUrl ? (
                    <img src={link.artworkUrl} alt={link.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <LinkIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">{link.destinations.length} destinos</p>
                  </div>
                </div>

                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                    <code className="flex-1 truncate text-xs">
                      {link.publicUrl ?? "URL pública ainda não configurada"}
                    </code>
                    {link.publicUrl && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => void copy(link.publicUrl!)}
                          className="h-7 w-7"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" asChild className="h-7 w-7">
                          <a href={link.publicUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">
                        {link.visits ? formatDecimalPtBr(link.visits, 0) : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Visitas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {link.conversions ? formatDecimalPtBr(link.conversions, 0) : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Conversões</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {link.conversionRate ? `${formatDecimalPtBr(link.conversionRate, 2)}%` : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Taxa</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {link.destinations.map((destination) => (
                      <Badge key={destination.code} variant="secondary">
                        {destination.label}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver analytics
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
