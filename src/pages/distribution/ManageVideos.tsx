import { useMemo, useState } from "react";
import { Eye, Plus, Search, Video } from "lucide-react";
import { Link } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import type { VideoAssetStatus } from "@/features/videos/videos.types";
import { useVideos } from "@/features/videos/use-videos";
import { formatDecimalPtBr } from "@/lib/format-money";

function toVisualStatus(status: VideoAssetStatus): Parameters<typeof StatusBadge>[0]["status"] {
  if (status === "DRAFT") return "draft";
  if (status === "LIVE") return "live";
  if (status === "FAILED" || status === "QC_FAILED") return "failed";
  if (status === "UPLOADING" || status === "PROCESSING" || status === "DELIVERING") return "processing";
  return "review";
}

function durationLabel(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default function ManageVideos() {
  const videosQuery = useVideos();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const videos = videosQuery.data?.items ?? [];

  const filteredVideos = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase("pt-BR");
    return videos.filter((video) => {
      const matchesSearch = !term || video.title.toLocaleLowerCase("pt-BR").includes(term) || video.artistName.toLocaleLowerCase("pt-BR").includes(term);
      const matchesStatus = statusFilter === "all" || video.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, videos]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Vídeos</h1>
            <p className="text-muted-foreground">Gerencie ativos audiovisuais e acompanhe o processamento e a entrega.</p>
          </div>
          <Link to="/distribution/videos/new"><Button className="gap-2"><Plus className="h-4 w-4" />Novo Vídeo</Button></Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar vídeos..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-10" disabled={videosQuery.data?.available === false} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={videosQuery.data?.available === false}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="PROCESSING">Processando</SelectItem>
              <SelectItem value="READY_FOR_QC">Aguardando QC</SelectItem>
              <SelectItem value="LIVE">Ativo</SelectItem>
              <SelectItem value="FAILED">Falhou</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!videosQuery.isLoading && videosQuery.data?.available === false && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Video className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Vídeos reais ainda não conectados neste preview</h3>
            <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">A tela preserva a referência visual, mas não cria visualizações, destinos, status ou vídeos fictícios.</p>
          </div>
        )}

        {videosQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="overflow-hidden rounded-xl border border-border bg-card"><div className="aspect-square animate-pulse bg-muted" /><div className="space-y-2 p-3"><div className="h-4 animate-pulse rounded bg-muted" /><div className="h-3 w-2/3 animate-pulse rounded bg-muted" /></div></div>)}
          </div>
        ) : videosQuery.data?.available && filteredVideos.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center"><Search className="mx-auto h-6 w-6 text-muted-foreground" /><h3 className="mt-3 text-lg font-medium">Nenhum vídeo encontrado</h3><p className="text-sm text-muted-foreground">Ajuste os filtros ou adicione um novo vídeo.</p></div>
        ) : videosQuery.data?.available ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredVideos.map((video) => (
              <article key={video.id} className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="relative aspect-square bg-muted">
                  {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><Video className="h-8 w-8 text-muted-foreground" /></div>}
                  <div className="absolute right-2 top-2"><StatusBadge status={toVisualStatus(video.status)} /></div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between"><div className="flex flex-wrap gap-1"><span className="rounded bg-black/60 px-2 py-0.5 text-xs text-white">{durationLabel(video.durationSeconds)}</span>{video.destinationLabels.slice(0, 2).map((destination) => <span key={destination} className="rounded bg-black/60 px-2 py-0.5 text-xs text-white">{destination}</span>)}</div></div>
                </div>
                <div className="p-3"><h3 className="truncate text-sm font-medium text-foreground">{video.title}</h3><p className="truncate text-xs text-muted-foreground">{video.artistName}</p><div className="mt-2 flex items-center justify-between"><div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" /><span>{video.viewCount ? formatDecimalPtBr(video.viewCount, 0) : "—"}</span></div><span className="text-xs text-muted-foreground">{new Date(video.createdAt).toLocaleDateString("pt-BR")}</span></div></div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
