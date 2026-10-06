import { Check, ChevronsUpDown, Search, UserRound } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ArtistLookupFieldProps {
  value: string;
  artists: string[];
  placeholder: string;
  onChange: (artistName: string) => void;
  onAddArtistToBase: (artistName: string) => void;
}

type PlatformKey = "spotify" | "youtube" | "appleMusic";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  appleMusic: "Apple Music",
};

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
  const [artistName, setArtistName] = useState("");
  const [platformQueries, setPlatformQueries] = useState<Record<PlatformKey, string>>({
    spotify: "",
    youtube: "",
    appleMusic: "",
  });
  const [locatedPlatforms, setLocatedPlatforms] = useState<PlatformKey[]>([]);

  const normalizedBaseQuery = baseQuery.trim().toLocaleLowerCase("pt-BR");
  const filteredArtists = useMemo(
    () =>
      artists.filter((artist) =>
        artist.toLocaleLowerCase("pt-BR").includes(normalizedBaseQuery),
      ),
    [artists, normalizedBaseQuery],
  );

  const selectArtist = (artist: string) => {
    onChange(artist);
    setBaseOpen(false);
    setBaseQuery("");
  };

  const resetFinder = () => {
    setArtistName("");
    setPlatformQueries({
      spotify: "",
      youtube: "",
      appleMusic: "",
    });
    setLocatedPlatforms([]);
  };

  const openFinder = () => {
    resetFinder();
    setFinderOpen(true);
  };

  const handleArtistNameChange = (nextName: string) => {
    setArtistName(nextName);
    setPlatformQueries((current) => ({
      spotify: current.spotify || nextName,
      youtube: current.youtube || nextName,
      appleMusic: current.appleMusic || nextName,
    }));
    setLocatedPlatforms([]);
  };

  const updatePlatformQuery = (platform: PlatformKey, query: string) => {
    setPlatformQueries((current) => ({ ...current, [platform]: query }));
    setLocatedPlatforms((current) => current.filter((item) => item !== platform));
  };

  const locatePlatform = (platform: PlatformKey) => {
    if (!platformQueries[platform].trim()) return;
    setLocatedPlatforms((current) =>
      current.includes(platform) ? current : [...current, platform],
    );
  };

  const confirmArtist = () => {
    const cleanName = artistName.trim();
    if (!cleanName || locatedPlatforms.length === 0) return;

    onAddArtistToBase(cleanName);
    onChange(cleanName);
    setFinderOpen(false);
    resetFinder();
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
                    Use o botão “Buscar artista” ao lado.
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button type="button" variant="outline" className="shrink-0" onClick={openFinder}>
          <Search className="mr-2 h-4 w-4" />
          Buscar artista
        </Button>
      </div>

      <Dialog
        open={finderOpen}
        onOpenChange={(nextOpen) => {
          setFinderOpen(nextOpen);
          if (!nextOpen) resetFinder();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buscar artista</DialogTitle>
            <DialogDescription>
              Informe o nome do artista e localize os perfis nas plataformas prioritárias.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label htmlFor="artist-finder-name">Nome do artista *</Label>
              <Input
                id="artist-finder-name"
                className="mt-1.5"
                value={artistName}
                onChange={(event) => handleArtistNameChange(event.target.value)}
                placeholder="Digite o nome do artista"
              />
            </div>

            <div className="space-y-4">
              {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => {
                const isLocated = locatedPlatforms.includes(platform);

                return (
                  <div
                    key={platform}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Label htmlFor={`artist-${platform}`}>
                        {PLATFORM_LABELS[platform]}
                      </Label>
                      {isLocated && (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          Perfil localizado
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        id={`artist-${platform}`}
                        value={platformQueries[platform]}
                        onChange={(event) =>
                          updatePlatformQuery(platform, event.target.value)
                        }
                        placeholder={`Digite o nome, URL ou ID do perfil no ${PLATFORM_LABELS[platform]}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        disabled={!platformQueries[platform].trim()}
                        onClick={() => locatePlatform(platform)}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Localizar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              Depois de confirmar o artista correto, ele entra na base Lander e poderá ser
              selecionado diretamente nos próximos lançamentos.
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={!artistName.trim() || locatedPlatforms.length === 0}
              onClick={confirmArtist}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirmar artista
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
