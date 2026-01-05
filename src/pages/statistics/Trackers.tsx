import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Bell, TrendingUp, TrendingDown, MoreVertical, ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const trackers = [
  {
    id: "1",
    name: "Sunset Dreams - Performance",
    type: "track",
    track: "Sunset Dreams",
    artist: "Luna Silva",
    metrics: { streams: 2450000, growth: 12.5, position: 1 },
    alerts: true,
    lastUpdate: "2024-02-15T10:30:00",
  },
  {
    id: "2",
    name: "Playlist Radar",
    type: "playlist",
    playlist: "Top Hits Brasil",
    tracks: 3,
    metrics: { followers: 5600000, growth: 5.2 },
    alerts: true,
    lastUpdate: "2024-02-15T09:00:00",
  },
  {
    id: "3",
    name: "Concorrente - Artista X",
    type: "competitor",
    artist: "Artista X",
    metrics: { streams: 8900000, growth: -2.3, monthlyListeners: 2100000 },
    alerts: false,
    lastUpdate: "2024-02-14T18:00:00",
  },
  {
    id: "4",
    name: "Luna Silva - Spotify",
    type: "artist",
    artist: "Luna Silva",
    metrics: { monthlyListeners: 1250000, growth: 18.7, followers: 890000 },
    alerts: true,
    lastUpdate: "2024-02-15T08:00:00",
  },
  {
    id: "5",
    name: "Noite Estrelada - Charts",
    type: "chart",
    track: "Noite Estrelada",
    metrics: { position: 5, peakPosition: 2, weeksOnChart: 8 },
    alerts: true,
    lastUpdate: "2024-02-15T06:00:00",
  },
];

export default function Trackers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTrackers = trackers.filter((tracker) => {
    const matchesSearch = tracker.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tracker.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      track: "Música",
      playlist: "Playlist",
      competitor: "Concorrente",
      artist: "Artista",
      chart: "Chart",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      track: "bg-green-500/10 text-green-500",
      playlist: "bg-purple-500/10 text-purple-500",
      competitor: "bg-orange-500/10 text-orange-500",
      artist: "bg-blue-500/10 text-blue-500",
      chart: "bg-yellow-500/10 text-yellow-500",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rastreadores</h1>
            <p className="text-muted-foreground">
              Monitore músicas, playlists, artistas e concorrentes
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Rastreador
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-2xl font-bold">{trackers.length}</p>
            <p className="text-sm text-muted-foreground">Rastreadores Ativos</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold">{trackers.filter(t => t.alerts).length}</p>
            <p className="text-sm text-muted-foreground">Com Alertas</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-muted-foreground">Alertas Recebidos</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold">15min</p>
            <p className="text-sm text-muted-foreground">Intervalo de Atualização</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar rastreadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="track">Músicas</SelectItem>
              <SelectItem value="playlist">Playlists</SelectItem>
              <SelectItem value="artist">Artistas</SelectItem>
              <SelectItem value="competitor">Concorrentes</SelectItem>
              <SelectItem value="chart">Charts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trackers List */}
        <div className="space-y-4">
          {filteredTrackers.map((tracker) => (
            <Card key={tracker.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{tracker.name}</h3>
                    {tracker.alerts && (
                      <Bell className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(tracker.type)} variant="secondary">
                      {getTypeLabel(tracker.type)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Atualizado: {new Date(tracker.lastUpdate).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  {tracker.metrics.streams !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatNumber(tracker.metrics.streams)}</p>
                      <p className="text-xs text-muted-foreground">Streams</p>
                    </div>
                  )}
                  {tracker.metrics.monthlyListeners !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatNumber(tracker.metrics.monthlyListeners)}</p>
                      <p className="text-xs text-muted-foreground">Ouvintes</p>
                    </div>
                  )}
                  {tracker.metrics.followers !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatNumber(tracker.metrics.followers)}</p>
                      <p className="text-xs text-muted-foreground">Seguidores</p>
                    </div>
                  )}
                  {tracker.metrics.position !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold">#{tracker.metrics.position}</p>
                      <p className="text-xs text-muted-foreground">Posição</p>
                    </div>
                  )}
                  {tracker.metrics.growth !== undefined && (
                    <div className="flex items-center gap-1">
                      {tracker.metrics.growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={tracker.metrics.growth > 0 ? "text-green-500" : "text-red-500"}>
                        {tracker.metrics.growth > 0 ? "+" : ""}{tracker.metrics.growth}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Configurar Alertas</DropdownMenuItem>
                      <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
