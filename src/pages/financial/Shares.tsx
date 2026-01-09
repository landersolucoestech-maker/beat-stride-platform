import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  Download,
  Users,
  CheckCircle2,
  Share2,
  CheckSquare,
  Filter,
  Search,
  Image,
  ExternalLink
} from "lucide-react";
import { releases } from "@/data/mockData";

interface Release {
  id: string;
  cover: string;
  title: string;
  artist: string;
  type: "Single" | "EP" | "Album";
  date: string;
  sent: boolean;
  shareStatus: "pending" | "applied";
  percentage: number;
}

const mockReleases: Release[] = [
  {
    id: "1",
    cover: "",
    title: "Xia As Amiguinhas",
    artist: "Dj Lael",
    type: "Single",
    date: "",
    sent: false,
    shareStatus: "pending",
    percentage: 0,
  },
  {
    id: "2",
    cover: "",
    title: "Waves",
    artist: "Dj Lael",
    type: "Single",
    date: "",
    sent: false,
    shareStatus: "pending",
    percentage: 0,
  },
  {
    id: "3",
    cover: "",
    title: "Vou Te Botar Vou Te Socar",
    artist: "Dj Lael",
    type: "Single",
    date: "13/06/2025",
    sent: false,
    shareStatus: "pending",
    percentage: 0,
  },
  {
    id: "4",
    cover: "",
    title: "Vida Rara",
    artist: "Dj Lael",
    type: "Single",
    date: "19/09/2025",
    sent: false,
    shareStatus: "pending",
    percentage: 0,
  },
  {
    id: "5",
    cover: "",
    title: "Summer Nights",
    artist: "Dj Lael",
    type: "Single",
    date: "01/03/2025",
    sent: true,
    shareStatus: "applied",
    percentage: 25,
  },
];

export default function Shares() {
  const [releasesList] = useState<Release[]>(mockReleases);
  const [searchQuery, setSearchQuery] = useState("");
  const [artistFilter, setArtistFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conferenceFilter, setConferenceFilter] = useState("all");
  const [shareAppliedFilter, setShareAppliedFilter] = useState("all");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  // Stats
  const shareToReceive = releasesList.filter(r => r.shareStatus === "pending" && !r.sent).length;
  const shareReceived = releasesList.filter(r => r.shareStatus === "applied").length;
  const shareToSend = releasesList.length;
  const shareApplied = releasesList.filter(r => r.percentage > 0).length;

  // Filter releases
  const filteredReleases = releasesList.filter(release => {
    const matchesSearch = release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         release.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArtist = artistFilter === "all" || release.artist === artistFilter;
    const matchesStatus = statusFilter === "all";
    const matchesConference = conferenceFilter === "all";
    const matchesShareApplied = shareAppliedFilter === "all" || 
                                (shareAppliedFilter === "yes" && release.percentage > 0) ||
                                (shareAppliedFilter === "no" && release.percentage === 0);
    
    return matchesSearch && matchesArtist && matchesStatus && matchesConference && matchesShareApplied;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setArtistFilter("all");
    setStatusFilter("all");
    setConferenceFilter("all");
    setShareAppliedFilter("all");
  };

  // Get unique artists
  const uniqueArtists = [...new Set(releasesList.map(r => r.artist))];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Shares</h1>
            <p className="text-muted-foreground">
              Conferência de share aplicado nos lançamentos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Registrar Share Pendente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Share Pendente</DialogTitle>
                  <DialogDescription>
                    Registre um novo share pendente para conferência.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Funcionalidade em desenvolvimento.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Share a Receber</p>
              <p className="text-3xl font-bold text-foreground">{shareToReceive}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Share Recebido</p>
              <p className="text-3xl font-bold text-foreground">{shareReceived}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Share a Enviar</p>
              <p className="text-3xl font-bold text-orange-500">{shareToSend}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Share2 className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Share Aplicado</p>
              <p className="text-3xl font-bold text-green-500">{shareApplied}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Filter className="h-5 w-5" />
            <span className="font-medium">Filtros</span>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou artista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Artista</label>
              <Select value={artistFilter} onValueChange={setArtistFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os artistas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os artistas</SelectItem>
                  {uniqueArtists.map((artist) => (
                    <SelectItem key={artist} value={artist}>{artist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Status Lançamento</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Conferência</label>
              <Select value={conferenceFilter} onValueChange={setConferenceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmed">Conferido</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Share Aplicado</label>
              <Select value={shareAppliedFilter} onValueChange={setShareAppliedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Lançamentos ({filteredReleases.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Gerencie o share aplicado e conferência de royalties
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Capa</TableHead>
                  <TableHead className="text-muted-foreground">Título</TableHead>
                  <TableHead className="text-muted-foreground">Artista</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">Enviado</TableHead>
                  <TableHead className="text-muted-foreground">Share</TableHead>
                  <TableHead className="text-muted-foreground">Percentual (%)</TableHead>
                  <TableHead className="text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReleases.map((release) => (
                  <TableRow key={release.id} className="border-border">
                    <TableCell>
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        {release.cover ? (
                          <img src={release.cover} alt={release.title} className="w-full h-full object-cover rounded" />
                        ) : (
                          <Image className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {release.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {release.artist}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {release.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {release.date || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={release.sent ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-border"}>
                        {release.sent ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={release.shareStatus === "applied" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}>
                        {release.shareStatus === "applied" ? "Aplicado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {release.percentage}%
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
