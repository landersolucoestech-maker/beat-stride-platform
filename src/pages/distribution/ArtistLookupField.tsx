import { Check, ChevronsUpDown, Plus, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [externalSearched, setExternalSearched] = useState(false);

  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredArtists = useMemo(
    () =>
      artists.filter((artist) =>
        artist.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
      ),
    [artists, normalizedQuery],
  );

  const exactMatch = artists.some(
    (artist) => artist.toLocaleLowerCase("pt-BR") === normalizedQuery,
  );
  const canSearchExternally = query.trim().length >= 2 && !exactMatch;

  const selectArtist = (artistName: string) => {
    onChange(artistName);
    setOpen(false);
    setQuery("");
    setExternalSearched(false);
  };

  const addArtist = (artistName: string) => {
    const cleanName = artistName.trim();
    if (!cleanName) return;
    onAddArtistToBase(cleanName);
    selectArtist(cleanName);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
          setExternalSearched(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[360px] p-0"
      >
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setExternalSearched(false);
              }}
              placeholder="Buscar artista na base Lander..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {filteredArtists.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Artistas na base
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
          )}

          {query.trim().length > 0 && filteredArtists.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-4">
              <p className="text-sm font-medium text-foreground">
                Artista não encontrado na base
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Busque os perfis nas plataformas prioritárias ou crie um artista novo.
              </p>
            </div>
          )}

          {canSearchExternally && !externalSearched && (
            <div className="mt-2 grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => setExternalSearched(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar “{query.trim()}” nas plataformas
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="justify-start"
                onClick={() => addArtist(query)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar novo artista “{query.trim()}”
              </Button>
            </div>
          )}

          {externalSearched && (
            <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <UserRound className="h-5 w-5 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{query.trim()}</p>
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
                Ao confirmar, esta identidade entra na base Lander e poderá ser reutilizada
                em próximos lançamentos sem nova busca externa.
              </div>

              <Button
                type="button"
                size="sm"
                className="mt-3 w-full"
                onClick={() => addArtist(query)}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirmar artista e adicionar à base
              </Button>
            </div>
          )}

          {query.trim().length === 0 && artists.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhum artista cadastrado.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
