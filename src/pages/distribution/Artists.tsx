import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Plus, Search, UserRound, Users } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateArtistIdentity, useArtistIdentities } from "@/features/artists/use-artist-identities";
import { useToast } from "@/hooks/use-toast";

const kindLabels = {
  PERSON: "Pessoa",
  DUO: "Dupla",
  GROUP: "Grupo",
  PROJECT: "Projeto",
} as const;

type ArtistKind = keyof typeof kindLabels;

export default function Artists() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [canonicalName, setCanonicalName] = useState("");
  const [kind, setKind] = useState<ArtistKind>("PERSON");
  const artistsQuery = useArtistIdentities();
  const createArtistMutation = useCreateArtistIdentity();
  const artists = artistsQuery.data?.items ?? [];
  const available = artistsQuery.data?.available !== false;

  const filteredArtists = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
    if (!query) return artists;
    return artists.filter((artist) => artist.displayName.toLocaleLowerCase("pt-BR").includes(query));
  }, [artists, searchTerm]);

  const activeRepresentations = artists.filter((artist) => artist.representationStatus === "ACTIVE").length;
  const verifiedAuthorities = artists.filter((artist) => artist.authorityVerified).length;

  const createArtist = async () => {
    if (!canonicalName.trim()) return;
    try {
      await createArtistMutation.mutateAsync({ canonicalName: canonicalName.trim(), kind });
      setCanonicalName("");
      setKind("PERSON");
      setCreateOpen(false);
      toast({ title: "Artist Identity criada", description: "O artista foi associado à organização ativa sem conceder autoridade automaticamente." });
    } catch {
      toast({ title: "Não foi possível criar o artista", description: "A operação real não foi concluída.", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Artistas</h1>
            <p className="text-muted-foreground">Gerencie identidades de artistas vinculadas à sua organização.</p>
          </div>
          <Button className="gradient-primary text-primary-foreground" disabled={!available} onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo artista
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><UserRound className="h-5 w-5 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">Identidades</p><p className="text-xl font-semibold text-foreground">{available ? artists.length : "—"}</p></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">Representações ativas</p><p className="text-xl font-semibold text-foreground">{available ? activeRepresentations : "—"}</p></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">Autoridade verificada</p><p className="text-xl font-semibold text-foreground">{available ? verifiedAuthorities : "—"}</p></div>
            </div>
          </div>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar artista..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} disabled={!available} />
        </div>

        {artistsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-5">
                <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                <div className="mt-4 h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : artistsQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">Não foi possível carregar os artistas</h2>
            <p className="mt-2 text-sm text-muted-foreground">A fonte real de Artist Identity respondeu com erro.</p>
            <Button variant="outline" className="mt-4" onClick={() => void artistsQuery.refetch()}>Tentar novamente</Button>
          </div>
        ) : !available ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted"><UserRound className="h-6 w-6 text-muted-foreground" /></div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Artist Identity ainda não está conectado neste preview</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">A tela usa o contrato da API real e não cria artistas fictícios para preencher a interface.</p>
            <Link to="/distribution/music" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">Voltar aos lançamentos</Link>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <UserRound className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">Nenhum artista encontrado</h2>
            <p className="mt-2 text-sm text-muted-foreground">Ajuste a busca ou cadastre uma nova Artist Identity.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredArtists.map((artist) => (
              <article key={artist.id} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                <div className="flex items-start gap-4">
                  {artist.imageUrl ? <img src={artist.imageUrl} alt={artist.displayName} className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><UserRound className="h-5 w-5 text-primary" /></div>}
                  <div className="min-w-0 flex-1"><h2 className="truncate font-semibold text-foreground">{artist.displayName}</h2><p className="mt-1 text-sm text-muted-foreground">{artist.status}</p></div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Representação</p><p className="mt-1 font-medium text-foreground">{artist.representationStatus}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Autoridade</p><p className="mt-1 font-medium text-foreground">{artist.authorityVerified ? "Verificada" : "Não verificada"}</p></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Artist Identity</DialogTitle>
            <DialogDescription>O cadastro cria uma associação com a organização atual. Representação e autoridade continuam processos separados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label htmlFor="artist-name">Nome artístico</Label><Input id="artist-name" className="mt-1.5" value={canonicalName} onChange={(event) => setCanonicalName(event.target.value)} /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={kind} onValueChange={(value) => setKind(value as ArtistKind)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(kindLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => void createArtist()} disabled={!canonicalName.trim() || createArtistMutation.isPending}>{createArtistMutation.isPending ? "Criando..." : "Criar artista"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
