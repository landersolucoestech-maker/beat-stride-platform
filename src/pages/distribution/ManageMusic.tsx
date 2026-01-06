import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, ExternalLink } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { releases } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageMusic() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReleases = releases.filter((release) => {
    const matchesSearch =
      release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || release.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Músicas</h1>
            <p className="text-muted-foreground">Gerencie todos os seus lançamentos musicais</p>
          </div>
          <Link to="/distribution/music/new">
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Distribuir Música
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="review">Em Revisão</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="live">Ativo</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {filteredReleases.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Nenhum lançamento encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou faça um novo lançamento
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredReleases.map((release) => (
              <div
                key={release.id}
                className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-square">
                  <img
                    src={release.cover}
                    alt={release.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={release.status} />
                  </div>
                  {release.preSaveLink && (
                    <a
                      href={release.preSaveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/90"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-foreground truncate text-sm">
                    {release.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {release.artist}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded-full">
                      {release.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(release.releaseDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
