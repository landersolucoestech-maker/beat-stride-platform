import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Send,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

interface ShareEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  percentage: number;
  status: "pending" | "accepted" | "rejected";
  type: "sent" | "received";
}

interface Release {
  id: string;
  cover: string;
  title: string;
  artist: string;
  type: "Single" | "EP" | "Album";
  date: string;
  releaseStatus: "draft" | "review" | "published";
  sharesSent: ShareEntry[];
  sharesReceived: ShareEntry[];
}

const mockReleases: Release[] = [
  {
    id: "1",
    cover: "",
    title: "Xia As Amiguinhas",
    artist: "Dj Lael",
    type: "Single",
    date: "15/01/2025",
    releaseStatus: "published",
    sharesSent: [
      { id: "s1", name: "MC Kevinho", email: "kevinho@email.com", role: "Compositor", percentage: 15, status: "accepted", type: "sent" },
      { id: "s2", name: "DJ Alok", email: "alok@email.com", role: "Produtor", percentage: 10, status: "pending", type: "sent" },
    ],
    sharesReceived: [],
  },
  {
    id: "2",
    cover: "",
    title: "Waves",
    artist: "Dj Lael",
    type: "Single",
    date: "",
    releaseStatus: "draft",
    sharesSent: [],
    sharesReceived: [
      { id: "r1", name: "Studio X", email: "studio@email.com", role: "Produtor", percentage: 20, status: "pending", type: "received" },
    ],
  },
  {
    id: "3",
    cover: "",
    title: "Vou Te Botar Vou Te Socar",
    artist: "Dj Lael",
    type: "Single",
    date: "13/06/2025",
    releaseStatus: "review",
    sharesSent: [],
    sharesReceived: [],
  },
  {
    id: "4",
    cover: "",
    title: "Vida Rara",
    artist: "Dj Lael",
    type: "Single",
    date: "19/09/2025",
    releaseStatus: "published",
    sharesSent: [
      { id: "s3", name: "Anitta", email: "anitta@email.com", role: "Feat", percentage: 30, status: "accepted", type: "sent" },
    ],
    sharesReceived: [],
  },
  {
    id: "5",
    cover: "",
    title: "Summer Nights",
    artist: "Dj Lael",
    type: "Single",
    date: "01/03/2025",
    releaseStatus: "published",
    sharesSent: [
      { id: "s4", name: "Pedro", email: "pedro@email.com", role: "Compositor", percentage: 15, status: "accepted", type: "sent" },
      { id: "s5", name: "Lucas", email: "lucas@email.com", role: "Produtor", percentage: 10, status: "rejected", type: "sent" },
    ],
    sharesReceived: [
      { id: "r2", name: "Label ABC", email: "label@email.com", role: "Editora", percentage: 5, status: "accepted", type: "received" },
    ],
  },
];

export default function Shares() {
  const [releasesList, setReleasesList] = useState<Release[]>(mockReleases);
  const [searchQuery, setSearchQuery] = useState("");
  const [artistFilter, setArtistFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shareTypeFilter, setShareTypeFilter] = useState("all");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [sendForm, setSendForm] = useState({
    name: "",
    email: "",
    role: "",
    percentage: "",
  });
  const [registerForm, setRegisterForm] = useState({
    releaseId: "",
    name: "",
    email: "",
    role: "",
    percentage: "",
  });

  // Calculate total percentages
  const getTotalSentPercentage = (release: Release) =>
    release.sharesSent.filter(s => s.status === "accepted").reduce((sum, s) => sum + s.percentage, 0);
  
  const getTotalReceivedPercentage = (release: Release) =>
    release.sharesReceived.filter(s => s.status === "accepted").reduce((sum, s) => sum + s.percentage, 0);

  // Stats
  const sharesPendingToReceive = releasesList.reduce((sum, r) => 
    sum + r.sharesReceived.filter(s => s.status === "pending").length, 0);
  const sharesReceived = releasesList.reduce((sum, r) => 
    sum + r.sharesReceived.filter(s => s.status === "accepted").length, 0);
  const sharesPendingToSend = releasesList.filter(r => r.sharesSent.length === 0).length;
  const sharesApplied = releasesList.filter(r => 
    r.sharesSent.some(s => s.status === "accepted") || r.sharesReceived.some(s => s.status === "accepted")
  ).length;

  // Filter releases
  const filteredReleases = releasesList.filter(release => {
    const matchesSearch = release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         release.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArtist = artistFilter === "all" || release.artist === artistFilter;
    const matchesStatus = statusFilter === "all" || release.releaseStatus === statusFilter;
    const matchesShareType = shareTypeFilter === "all" || 
                             (shareTypeFilter === "sent" && release.sharesSent.length > 0) ||
                             (shareTypeFilter === "received" && release.sharesReceived.length > 0) ||
                             (shareTypeFilter === "none" && release.sharesSent.length === 0 && release.sharesReceived.length === 0);
    
    return matchesSearch && matchesArtist && matchesStatus && matchesShareType;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setArtistFilter("all");
    setStatusFilter("all");
    setShareTypeFilter("all");
  };

  // Get unique artists
  const uniqueArtists = [...new Set(releasesList.map(r => r.artist))];

  const handleSendShare = () => {
    if (!selectedRelease || !sendForm.name || !sendForm.email || !sendForm.role || !sendForm.percentage) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    const newShare: ShareEntry = {
      id: `s${Date.now()}`,
      name: sendForm.name,
      email: sendForm.email,
      role: sendForm.role,
      percentage: parseFloat(sendForm.percentage),
      status: "pending",
      type: "sent",
    };

    setReleasesList(prev => prev.map(r => 
      r.id === selectedRelease.id 
        ? { ...r, sharesSent: [...r.sharesSent, newShare] }
        : r
    ));

    toast({ title: "Share enviado", description: `Share enviado para ${sendForm.name}` });
    setSendForm({ name: "", email: "", role: "", percentage: "" });
    setIsSendDialogOpen(false);
  };

  const handleRegisterShare = () => {
    if (!registerForm.releaseId || !registerForm.name || !registerForm.email || !registerForm.role || !registerForm.percentage) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    const newShare: ShareEntry = {
      id: `r${Date.now()}`,
      name: registerForm.name,
      email: registerForm.email,
      role: registerForm.role,
      percentage: parseFloat(registerForm.percentage),
      status: "pending",
      type: "received",
    };

    setReleasesList(prev => prev.map(r => 
      r.id === registerForm.releaseId 
        ? { ...r, sharesReceived: [...r.sharesReceived, newShare] }
        : r
    ));

    toast({ title: "Share registrado", description: `Share a receber registrado de ${registerForm.name}` });
    setRegisterForm({ releaseId: "", name: "", email: "", role: "", percentage: "" });
    setIsRegisterDialogOpen(false);
  };

  const handleAcceptShare = (releaseId: string, shareId: string) => {
    setReleasesList(prev => prev.map(r => 
      r.id === releaseId 
        ? { ...r, sharesReceived: r.sharesReceived.map(s => s.id === shareId ? { ...s, status: "accepted" as const } : s) }
        : r
    ));
    toast({ title: "Share aceito", description: "O share foi aceito com sucesso." });
    setIsDetailsDialogOpen(false);
  };

  const handleRejectShare = (releaseId: string, shareId: string) => {
    setReleasesList(prev => prev.map(r => 
      r.id === releaseId 
        ? { ...r, sharesReceived: r.sharesReceived.map(s => s.id === shareId ? { ...s, status: "rejected" as const } : s) }
        : r
    ));
    toast({ title: "Share recusado", description: "O share foi recusado." });
    setIsDetailsDialogOpen(false);
  };

  const handleRevokeShare = (releaseId: string, shareId: string) => {
    setReleasesList(prev => prev.map(r => 
      r.id === releaseId 
        ? { ...r, sharesSent: r.sharesSent.filter(s => s.id !== shareId) }
        : r
    ));
    toast({ title: "Share revogado", description: "O share foi revogado." });
    setIsDetailsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Aceito</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Recusado</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendente</Badge>;
    }
  };

  const getReleaseStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Publicado</Badge>;
      case "review":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Em Revisão</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Rascunho</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Shares</h1>
            <p className="text-muted-foreground">
              Resumo de shares enviados e recebidos por lançamento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowDownLeft className="h-4 w-4" />
                  Registrar Share a Receber
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Share a Receber</DialogTitle>
                  <DialogDescription>
                    Registre um share que você deve receber de outra pessoa.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Lançamento</Label>
                    <Select value={registerForm.releaseId} onValueChange={(v) => setRegisterForm(p => ({ ...p, releaseId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o lançamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {releasesList.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.title} - {r.artist}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Remetente</Label>
                    <Input 
                      placeholder="Ex: João Silva"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      placeholder="email@exemplo.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Select value={registerForm.role} onValueChange={(v) => setRegisterForm(p => ({ ...p, role: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Compositor">Compositor</SelectItem>
                        <SelectItem value="Produtor">Produtor</SelectItem>
                        <SelectItem value="Feat">Feat</SelectItem>
                        <SelectItem value="Editora">Editora</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Percentual (%)</Label>
                    <Input 
                      type="number"
                      placeholder="Ex: 10"
                      min="0"
                      max="100"
                      value={registerForm.percentage}
                      onChange={(e) => setRegisterForm(p => ({ ...p, percentage: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleRegisterShare}>Registrar</Button>
                </DialogFooter>
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
              <p className="text-sm text-muted-foreground">Shares Pendentes a Receber</p>
              <p className="text-3xl font-bold text-foreground">{sharesPendingToReceive}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <ArrowDownLeft className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Shares Recebidos</p>
              <p className="text-3xl font-bold text-foreground">{sharesReceived}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lançamentos sem Share</p>
              <p className="text-3xl font-bold text-orange-500">{sharesPendingToSend}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Share2 className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Shares Aplicados</p>
              <p className="text-3xl font-bold text-green-500">{sharesApplied}</p>
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
                  <SelectItem value="review">Em Revisão</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Tipo de Share</label>
              <Select value={shareTypeFilter} onValueChange={setShareTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sent">Com Enviados</SelectItem>
                  <SelectItem value="received">Com Recebidos</SelectItem>
                  <SelectItem value="none">Sem Shares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Lançamentos ({filteredReleases.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Clique em Ações para enviar, visualizar ou gerenciar shares
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
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-center">Enviados</TableHead>
                  <TableHead className="text-muted-foreground text-center">Recebidos</TableHead>
                  <TableHead className="text-muted-foreground">% Total</TableHead>
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
                    <TableCell>
                      {getReleaseStatusBadge(release.releaseStatus)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowUpRight className="h-4 w-4 text-orange-500" />
                        <span className="text-foreground font-medium">{release.sharesSent.length}</span>
                        {release.sharesSent.filter(s => s.status === "pending").length > 0 && (
                          <Badge className="ml-1 h-5 px-1.5 text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            {release.sharesSent.filter(s => s.status === "pending").length}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        <span className="text-foreground font-medium">{release.sharesReceived.length}</span>
                        {release.sharesReceived.filter(s => s.status === "pending").length > 0 && (
                          <Badge className="ml-1 h-5 px-1.5 text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            {release.sharesReceived.filter(s => s.status === "pending").length}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="text-orange-500">{getTotalSentPercentage(release)}%</span>
                      {" / "}
                      <span className="text-green-500">{getTotalReceivedPercentage(release)}%</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedRelease(release);
                            setIsSendDialogOpen(true);
                          }}>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedRelease(release);
                            setIsDetailsDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Send Share Dialog */}
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Share</DialogTitle>
              <DialogDescription>
                Envie um share de royalties para {selectedRelease?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Destinatário</Label>
                <Input 
                  placeholder="Ex: João Silva"
                  value={sendForm.name}
                  onChange={(e) => setSendForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="email@exemplo.com"
                  value={sendForm.email}
                  onChange={(e) => setSendForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select value={sendForm.role} onValueChange={(v) => setSendForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compositor">Compositor</SelectItem>
                    <SelectItem value="Produtor">Produtor</SelectItem>
                    <SelectItem value="Feat">Feat</SelectItem>
                    <SelectItem value="Editora">Editora</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Percentual (%)</Label>
                <Input 
                  type="number"
                  placeholder="Ex: 10"
                  min="0"
                  max="100"
                  value={sendForm.percentage}
                  onChange={(e) => setSendForm(p => ({ ...p, percentage: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSendShare}>Enviar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes de Shares - {selectedRelease?.title}</DialogTitle>
              <DialogDescription>
                Gerencie os shares enviados e recebidos deste lançamento
              </DialogDescription>
            </DialogHeader>
            
            {selectedRelease && (
              <div className="space-y-6 py-4">
                {/* Sent Shares */}
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-2 mb-3">
                    <ArrowUpRight className="h-4 w-4 text-orange-500" />
                    Shares Enviados ({selectedRelease.sharesSent.length})
                  </h4>
                  {selectedRelease.sharesSent.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum share enviado.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRelease.sharesSent.map((share) => (
                        <div key={share.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-foreground">{share.name}</p>
                            <p className="text-sm text-muted-foreground">{share.role} • {share.percentage}%</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(share.status)}
                            {share.status === "pending" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRevokeShare(selectedRelease.id, share.id)}
                              >
                                Revogar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Received Shares */}
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-2 mb-3">
                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    Shares Recebidos ({selectedRelease.sharesReceived.length})
                  </h4>
                  {selectedRelease.sharesReceived.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum share recebido.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRelease.sharesReceived.map((share) => (
                        <div key={share.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-foreground">{share.name}</p>
                            <p className="text-sm text-muted-foreground">{share.role} • {share.percentage}%</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(share.status)}
                            {share.status === "pending" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-500 hover:text-green-500"
                                  onClick={() => handleAcceptShare(selectedRelease.id, share.id)}
                                >
                                  Aceitar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleRejectShare(selectedRelease.id, share.id)}
                                >
                                  Recusar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
