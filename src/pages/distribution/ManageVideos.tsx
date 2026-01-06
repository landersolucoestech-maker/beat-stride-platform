import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Search, Play, Eye, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const mockVideos = [
  {
    id: "1",
    title: "Videoclipe Oficial - Sunset Dreams",
    artist: "Luna Silva",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=68&fit=crop",
    platform: "YouTube",
    views: 1250000,
    uploadDate: "2024-01-15",
    duration: "3:45",
    status: "published" as const,
  },
  {
    id: "2",
    title: "Lyric Video - Noite Estrelada",
    artist: "Pedro Santos",
    thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=120&h=68&fit=crop",
    platform: "YouTube",
    views: 450000,
    uploadDate: "2024-02-01",
    duration: "4:12",
    status: "published" as const,
  },
  {
    id: "3",
    title: "Behind the Scenes - Tour 2024",
    artist: "Luna Silva",
    thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&h=68&fit=crop",
    platform: "YouTube",
    views: 89000,
    uploadDate: "2024-02-10",
    duration: "12:30",
    status: "processing" as const,
  },
  {
    id: "4",
    title: "Acoustic Session - Amor Infinito",
    artist: "Maria Costa",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=68&fit=crop",
    platform: "Vevo",
    views: 0,
    uploadDate: "2024-02-15",
    duration: "5:20",
    status: "pending" as const,
  },
];

export default function ManageVideos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVideos = mockVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Vídeos</h1>
            <p className="text-muted-foreground">
              Gerencie seus videoclipes e conteúdo audiovisual
            </p>
          </div>
          <Link to="/distribution/videos/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Vídeo
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockVideos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Vídeos</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">1.8M</p>
                <p className="text-sm text-muted-foreground">Views Totais</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Publicados</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vídeos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {filteredVideos.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Nenhum vídeo encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou adicione um novo vídeo
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={video.status} />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/90 bg-black/50 px-2 py-0.5 rounded">
                        {video.duration}
                      </span>
                      <span className="text-xs text-white/90 bg-black/50 px-2 py-0.5 rounded">
                        {video.platform}
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-primary/90 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-primary">
                      <Play className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-1 text-sm mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {video.artist}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{formatViews(video.views)} views</span>
                    </div>
                    <span>
                      {new Date(video.uploadDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
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
