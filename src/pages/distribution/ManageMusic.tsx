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

        {/* Table */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                    Lançamento
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Tipo
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Data de Lançamento
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                    Pre-Save
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReleases.map((release) => (
                  <tr
                    key={release.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={release.cover}
                          alt={release.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground">{release.title}</p>
                          <p className="text-sm text-muted-foreground">{release.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground capitalize px-2 py-1 bg-muted rounded-full">
                        {release.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(release.releaseDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={release.status} />
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      {release.preSaveLink ? (
                        <a
                          href={release.preSaveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                        >
                          Acessar
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReleases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
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
          )}
        </div>
      </div>
    </MainLayout>
  );
}
