import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Disc3, Filter, Plus, Search, ShieldCheck, X } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ReleaseFormModal,
  type PrototypeReleaseDraft,
} from "./ReleaseFormModal";
import type { CatalogReleaseListItem, CatalogReleaseStatus } from "@/features/catalog/catalog.types";
import { useCatalogReleases } from "@/features/catalog/use-catalog-releases";

const statusFilters = [
  { value: "all", label: "Todos" },
  { value: "DRAFT", label: "Rascunho" },
  { value: "SUBMITTED", label: "Aguardando aprovação" },
  { value: "SCHEDULED", label: "Agendado" },
  { value: "LIVE", label: "Ativo" },
  { value: "REJECTED", label: "Rejeitado" },
] as const;

function toVisualStatus(status: CatalogReleaseStatus): Parameters<typeof StatusBadge>[0]["status"] {
  if (status === "DRAFT") return "draft";
  if (status === "SCHEDULED") return "scheduled";
  if (status === "LIVE" || status === "PARTIALLY_LIVE") return "live";
  if (status === "REJECTED") return "rejected";
  if (status === "DISTRIBUTION_FAILED") return "failed";
  if (status === "DISTRIBUTING" || status === "VALIDATING") return "processing";
  return "review";
}

function formatReleaseDate(value: string | null): string {
  if (!value) return "Data não definida";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function releaseMatches(release: CatalogReleaseListItem, searchTerm: string, statusFilter: string): boolean {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const matchesSearch =
    normalizedSearch.length === 0 ||
    release.title.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
    release.artistName.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
  const matchesStatus = statusFilter === "all" || release.status === statusFilter;
  return matchesSearch && matchesStatus;
}

export default function ManageMusic() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [prototypeDrafts, setPrototypeDrafts] = useState<PrototypeReleaseDraft[]>([]);
  const [submissionNotice, setSubmissionNotice] = useState(false);
  const releasesQuery = useCatalogReleases();

  const releases = releasesQuery.data?.items ?? [];
  const filteredReleases = useMemo(
    () => releases.filter((release) => releaseMatches(release, searchTerm, statusFilter)),
    [releases, searchTerm, statusFilter],
  );
  const filteredPrototypeDrafts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

    return prototypeDrafts.filter((release) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        release.title.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        release.artistName.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || statusFilter === "SUBMITTED";

      return matchesSearch && matchesStatus;
    });
  }, [prototypeDrafts, searchTerm, statusFilter]);
  const dataUnavailable = releasesQuery.data?.available === false;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Músicas</h1>
            <p className="text-muted-foreground">Gerencie seus lançamentos musicais e acompanhe o status operacional.</p>
          </div>
          <Button
            type="button"
            className="gradient-primary text-primary-foreground"
            onClick={() => setReleaseModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Distribuir Música
          </Button>
        </div>

        {submissionNotice && (
          <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Lançamento enviado para aprovação
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                O envio foi concluído e está aguardando análise. Somente o Administrador da Plataforma pode aprovar e liberar a distribuição.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSubmissionNotice(false)}
              aria-label="Fechar confirmação"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por título ou artista..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-10" disabled={dataUnavailable} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={dataUnavailable}>
            <SelectTrigger className="w-full sm:w-[190px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {filteredPrototypeDrafts.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Envios desta sessão</h2>
                <p className="text-xs text-muted-foreground">
                  Envios locais do protótipo aguardando aprovação do Administrador da Plataforma.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {filteredPrototypeDrafts.length} {filteredPrototypeDrafts.length === 1 ? "envio" : "envios"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredPrototypeDrafts.map((release) => (
                <div
                  key={release.id}
                  className="group overflow-hidden rounded-xl border border-primary/30 bg-card"
                >
                  <div className="relative aspect-square bg-muted">
                    {release.coverUrl ? (
                      <img
                        src={release.coverUrl}
                        alt={release.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Disc3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <span className="inline-flex items-center rounded-full bg-warning/90 px-2.5 py-1 text-[11px] font-medium text-warning-foreground shadow-sm">
                        Aguardando aprovação
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-sm font-medium text-foreground">
                      {release.title}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {release.artistName}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {release.type}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatReleaseDate(release.releaseDate)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 px-2.5 py-2">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                      <p className="text-[11px] leading-4 text-muted-foreground">
                        Aguardando aprovação do Administrador da Plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {releasesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-square animate-pulse bg-muted" />
                <div className="space-y-2 p-3"><div className="h-4 animate-pulse rounded bg-muted" /><div className="h-3 w-2/3 animate-pulse rounded bg-muted" /></div>
              </div>
            ))}
          </div>
        ) : releasesQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-card p-12 text-center">
            <h3 className="text-lg font-medium text-foreground">Não foi possível carregar o catálogo</h3>
            <p className="mt-1 text-sm text-muted-foreground">A fonte real de dados respondeu com erro. Tente novamente quando a API estiver disponível.</p>
            <Button variant="outline" className="mt-4" onClick={() => void releasesQuery.refetch()}>Tentar novamente</Button>
          </div>
        ) : dataUnavailable ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Disc3 className="h-6 w-6 text-muted-foreground" /></div>
            <h3 className="text-lg font-medium text-foreground">Catálogo real ainda não conectado neste preview</h3>
            <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">A interface já usa o contrato da API real. O GitHub Pages continua servindo apenas o frontend e não inventa lançamentos para preencher a tela.</p>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Search className="h-6 w-6 text-muted-foreground" /></div>
            <h3 className="text-lg font-medium text-foreground">Nenhum lançamento encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou inicie um novo lançamento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredReleases.map((release) => (
              <Link
                key={release.id}
                to={`/distribution/music/${release.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-square bg-muted">
                  {release.coverUrl ? <img src={release.coverUrl} alt={release.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center"><Disc3 className="h-8 w-8 text-muted-foreground" /></div>}
                  <div className="absolute right-2 top-2"><StatusBadge status={toVisualStatus(release.status)} /></div>
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-medium text-foreground">{release.title}</h3>
                  <p className="truncate text-xs text-muted-foreground">{release.artistName}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{release.type}</span>
                    <span className="truncate text-xs text-muted-foreground">{formatReleaseDate(release.releaseDate)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ReleaseFormModal
        open={releaseModalOpen}
        onOpenChange={setReleaseModalOpen}
        onCreateDraft={(draft) => {
          setPrototypeDrafts((current) => [draft, ...current]);
          setSubmissionNotice(true);
        }}
      />
    </MainLayout>
  );
}
