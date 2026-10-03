import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Disc3, Filter, Plus, Search } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalogReleases } from "@/features/catalog/use-catalog-releases";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  scheduled: "Agendado",
  live: "Ativo",
  rejected: "Rejeitado",
  correction_required: "Correção necessária",
};

export default function ManageMusic() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: releases = [] } = useCatalogReleases();

  const filteredReleases = useMemo(() => releases.filter((release) => {
    const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
    const matchesSearch = !query || release.title.toLocaleLowerCase("pt-BR").includes(query) || release.artistName.toLocaleLowerCase("pt-BR").includes(query);
    return matchesSearch && (statusFilter === "all" || release.status === statusFilter);
  }), [releases, searchTerm, statusFilter]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-foreground">Gerenciar Músicas</h1><p className="text-muted-foreground">Gerencie todos os seus lançamentos musicais</p></div>
          <Link to="/distribution/music/new"><Button className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Distribuir Música</Button></Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por título ou artista..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-[210px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="review">Em revisão</SelectItem><SelectItem value="correction_required">Correção necessária</SelectItem><SelectItem value="scheduled">Agendado</SelectItem><SelectItem value="live">Ativo</SelectItem><SelectItem value="rejected">Rejeitado</SelectItem></SelectContent></Select>
        </div>

        {filteredReleases.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-12"><div className="flex flex-col items-center justify-center text-center"><div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Disc3 className="h-6 w-6 text-muted-foreground" /></div><h3 className="text-lg font-medium text-foreground mb-1">Nenhum lançamento disponível</h3><p className="text-sm text-muted-foreground max-w-md">Os lançamentos reais desta organização aparecerão aqui. Você já pode iniciar um novo lançamento pela ação acima.</p></div></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredReleases.map((release) => (
              <div key={release.id} className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="relative aspect-square bg-muted flex items-center justify-center">{release.coverUrl ? <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <Disc3 className="h-10 w-10 text-muted-foreground" />}<span className="absolute top-2 right-2 rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground">{statusLabels[release.status] ?? release.status}</span></div>
                <div className="p-3"><h3 className="font-medium text-foreground truncate text-sm">{release.title}</h3><p className="text-xs text-muted-foreground truncate">{release.artistName}</p><div className="flex items-center justify-between mt-2"><span className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded-full">{release.type}</span><span className="text-xs text-muted-foreground">{release.releaseDate ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${release.releaseDate}T00:00:00Z`)) : "Sem data"}</span></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
