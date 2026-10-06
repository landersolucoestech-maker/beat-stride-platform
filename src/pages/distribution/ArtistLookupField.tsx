import { Check, ChevronsUpDown, Plus, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ArtistLookupFieldProps {
  value: string;
  artists: string[];
  placeholder: string;
  onChange: (artistName: string) => void;
  onAddArtistToBase: (artistName: string) => void;
}

export function ArtistLookupField({
  value,
  artists,
  placeholder,
  onChange,
  onAddArtistToBase,
}: ArtistLookupFieldProps) {
  const [baseOpen, setBaseOpen] = useState(false);
  const [baseQuery, setBaseQuery] = useState("");
  const [finderOpen, setFinderOpen] = useState(false);
  const [finderQuery, setFinderQuery] = useState("");
  const [externalSearched, setExternalSearched] = useState(false);

  const normalizedBaseQuery = baseQuery.trim().toLocaleLowerCase("pt-BR");
  const filteredArtists = useMemo(
    () =>
      artists.filter((artist) =>
        artist.toLocaleLowerCase("pt-BR").includes(normalizedBaseQuery),
      ),
    [artists, normalizedBaseQuery],
  );

  const selectArtist = (artistName: string) => {
    onChange(artistName);
    setBaseOpen(false);
    setBaseQuery("");
  };

  const addArtist = (artistName: string) => {
    const cleanName = artistName.trim();
    if (!cleanName) return;

    onAddArtistToBase(cleanName);
    onChange(cleanName);
    setFinderOpen(false);
    setFinderQuery("");
    setExternalSearched(false);
  };

  return (
    <>
      <div className="flex w-full gap-2">
        <Popover
          open={baseOpen}
          onOpenChange={(nextOpen) => {
            setBaseOpen(nextOpen);
            if (!nextOpen) setBaseQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={baseOpen}
              className={cn(
                "min-w-0 flex-1 justify-between font-normal",
                !value && "text-muted-foreground",
              )}
            >
              <span className="truncate">{value || placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] min-w-[340px] p-0"
          >
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={baseQuery}
                  onChange={(event) => setBaseQuery(event.target.value)}
                  placeholder="Buscar artista na base Lander..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredArtists.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Artistas cadastrados
                  </p>
                  {filteredArtists.map((artist) => (
                    <button
                      key={artist}
                      type="button"
                      onClick={() => selectArtist(artist)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <UserRound className="h-4 w-4 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {artist}
                      </span>
                      {value === artist && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Nenhum artista encontrado na base
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use o botão “Encontrar artista” ao lado do campo.
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={() => setFinderOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          Encontrar artista
        </Button>
      </div>

      <Dialog
        open={finderOpen}
        onOpenChange={(nextOpen) => {
          setFinderOpen(nextOpen);
          if (!nextOpen) {
            setFinderQuery("");
            setExternalSearched(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Encontrar artista</DialogTitle>
            <DialogDescription>
              Procure um artista que ainda não está cadastrado na base Lander.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={finderQuery}
                  onChange={(event) => {
                    setFinderQuery(event.target.value);
                    setExternalSearched(false);
                  }}
                  placeholder="Digite o nome do artista"
                  className="pl-9"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                A busca prioriza Spotify, YouTube e Apple Music.
              </p>
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={finderQuery.trim().length < 2}
              onClick={() => setExternalSearched(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar nas plataformas
            </Button>

            {externalSearched && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <UserRound className="h-5 w-5 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{finderQuery.trim()}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Perfis compatíveis encontrados para conferência.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">Spotify</Badge>
                      <Badge variant="secondary">YouTube</Badge>
                      <Badge variant="secondary">Apple Music</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-background/80 p-3 text-xs text-muted-foreground">
                  Ao confirmar, o artista entra na base Lander e poderá ser reutilizado
                  nos próximos lançamentos.
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => addArtist(finderQuery)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar artista e adicionar à base
                </Button>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                disabled={!finderQuery.trim()}
                onClick={() => addArtist(finderQuery)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar novo artista sem perfil existente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
